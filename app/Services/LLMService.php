<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LLMService
{
    /**
     * Stream response from the selected AI provider.
     */
    public function streamResponse(string $provider, string $endpoint, string $model, string $apiKey, array $messages, ?string $systemPrompt = null): void
    {
        switch ($provider) {
            case 'gemini':
                $this->streamGemini($endpoint, $model, $apiKey, $messages, $systemPrompt);
                break;
            case 'ollama':
                $this->streamOllama($endpoint, $model, $messages, $systemPrompt);
                break;
            case 'openai':
            default:
                $this->streamOpenAI($endpoint, $model, $apiKey, $messages, $systemPrompt);
                break;
        }
    }

    /**
     * Fetch available models for the selected provider.
     */
    public function fetchModels(string $provider, string $endpoint, string $apiKey): array
    {
        $endpoint = rtrim($endpoint, '/');

        try {
            switch ($provider) {
                case 'gemini':
                    $url = $endpoint . '/v1beta/models?key=' . $apiKey;
                    $response = Http::timeout(10)->get($url);
                    if ($response->successful()) {
                        return collect($response->json('models', []))
                            ->filter(fn($m) => str_contains($m['name'], 'gemini'))
                            ->map(fn($m) => str_replace('models/', '', $m['name']))
                            ->values()
                            ->toArray();
                    }
                    throw new \Exception('Gemini API Error: ' . $response->status());

                case 'ollama':
                    $parsed = parse_url($endpoint);
                    $baseUrl = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost') . (!empty($parsed['port']) ? ':' . $parsed['port'] : '');
                    $response = Http::timeout(5)->get($baseUrl . '/api/tags');
                    if ($response->successful()) {
                        return collect($response->json('models', []))->pluck('name')->toArray();
                    }
                    throw new \Exception('Ollama Error: ' . $response->status());

                case 'openai':
                default:
                    $parsed = parse_url($endpoint);
                    $baseUrl = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
                    if (!empty($parsed['port'])) $baseUrl .= ':' . $parsed['port'];
                    
                    $headers = $apiKey ? ['Authorization' => 'Bearer ' . $apiKey] : [];
                    $response = Http::withHeaders($headers)->timeout(10)->get($baseUrl . '/v1/models');
                    if ($response->successful()) {
                        return collect($response->json('data', []))->pluck('id')->toArray();
                    }
                    throw new \Exception('OpenAI-Compatible Error: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error("LLMService::fetchModels error: " . $e->getMessage());
            throw $e;
        }
    }

    private function streamGemini(string $endpoint, string $model, string $apiKey, array $messages, ?string $systemPrompt): void
    {
        $url = rtrim($endpoint, '/') . "/v1beta/models/{$model}:streamGenerateContent?key={$apiKey}";

        // Format messages for Gemini
        $contents = [];
        foreach ($messages as $msg) {
            $role = $msg['role'] === 'assistant' ? 'model' : 'user';
            
            $parts = [];
            if (is_array($msg['content'])) {
                foreach ($msg['content'] as $part) {
                    if ($part['type'] === 'text') {
                        $parts[] = ['text' => $part['text']];
                    } elseif ($part['type'] === 'image_url') {
                        $imgData = $part['image_url']['url'];
                        if (str_contains($imgData, ';base64,')) {
                            $split = explode(';base64,', $imgData);
                            $mime = str_replace('data:', '', $split[0]);
                            $parts[] = [
                                'inline_data' => [
                                    'mime_type' => $mime,
                                    'data' => $split[1]
                                ]
                            ];
                        }
                    }
                }
            } else {
                $parts[] = ['text' => $msg['content']];
            }

            $contents[] = [
                'role' => $role,
                'parts' => $parts
            ];
        }

        $payload = ['contents' => $contents];
        if ($systemPrompt) {
            $payload['system_instruction'] = [
                'parts' => [['text' => $systemPrompt]]
            ];
        }

        try {
            $response = Http::withOptions(['stream' => true])->timeout(120)->post($url, $payload);

            if ($response->successful()) {
                $stream = $response->toPsrResponse()->getBody()->detach();
                $buffer = '';

                while (!feof($stream)) {
                    $chunk = fread($stream, 1024);
                    if ($chunk === false) break;
                    $buffer .= $chunk;

                    // Gemini sends a stream of JSON objects or a JSON array.
                    // We need to parse valid JSON objects from the buffer.
                    // This is a simplified parser for streaming JSON.
                    while (($pos = strpos($buffer, '},')) !== false || ($pos = strpos($buffer, '}')) !== false) {
                        $jsonStr = substr($buffer, 0, $pos + 1);
                        // Clean up if it's part of an array
                        $jsonStr = ltrim($jsonStr, "[\n\r ,");
                        
                        $data = json_decode($jsonStr, true);
                        if ($data && isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                            $text = $data['candidates'][0]['content']['parts'][0]['text'];
                            echo "data: " . json_encode(['text' => $text]) . "\n\n";
                            ob_flush();
                            flush();
                        }
                        
                        $buffer = substr($buffer, $pos + 1);
                    }
                }
            } else {
                $this->sendError("Gemini API Error: " . $response->status());
            }
        } catch (\Exception $e) {
            $this->sendError("Gemini Stream Error: " . $e->getMessage());
        }
    }

    private function streamOllama(string $endpoint, string $model, array $messages, ?string $systemPrompt): void
    {
        $parsed = parse_url($endpoint);
        $baseUrl = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost') . (!empty($parsed['port']) ? ':' . $parsed['port'] : '');
        $chatUrl = $baseUrl . '/api/chat';

        $ollamaMessages = [];
        if ($systemPrompt) {
            $ollamaMessages[] = ['role' => 'system', 'content' => $systemPrompt];
        }
        foreach ($messages as $msg) {
            $ollamaMessages[] = $msg;
        }

        try {
            $response = Http::timeout(120)->withOptions(['stream' => true])->post($chatUrl, [
                'model' => $model,
                'messages' => $ollamaMessages,
                'stream' => true,
            ]);

            if ($response->successful()) {
                $stream = $response->toPsrResponse()->getBody()->detach();
                while (!feof($stream)) {
                    $line = fgets($stream);
                    if ($line === false || empty(trim($line))) continue;

                    $data = json_decode($line, true);
                    if ($data && isset($data['message']['content'])) {
                        echo "data: " . json_encode(['text' => $data['message']['content']]) . "\n\n";
                        ob_flush();
                        flush();
                    }
                }
            } else {
                $this->sendError("Ollama connection failed. Status: " . $response->status());
            }
        } catch (\Exception $e) {
            $this->sendError("Ollama Stream Error: " . $e->getMessage());
        }
    }

    private function streamOpenAI(string $endpoint, string $model, string $apiKey, array $messages, ?string $systemPrompt): void
    {
        $parsed = parse_url($endpoint);
        $baseUrl = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
        if (!empty($parsed['port'])) $baseUrl .= ':' . $parsed['port'];
        $chatUrl = rtrim($baseUrl, '/') . '/v1/chat/completions';

        $headers = $apiKey ? ['Authorization' => 'Bearer ' . $apiKey] : [];
        $openAiMessages = [];
        if ($systemPrompt) {
            $openAiMessages[] = ['role' => 'system', 'content' => $systemPrompt];
        }
        foreach ($messages as $msg) {
            $openAiMessages[] = $msg;
        }

        try {
            $response = Http::withHeaders($headers)->timeout(120)->withOptions(['stream' => true])->post($chatUrl, [
                'model' => $model,
                'messages' => $openAiMessages,
                'stream' => true,
            ]);

            if ($response->successful()) {
                $stream = $response->toPsrResponse()->getBody()->detach();
                while (!feof($stream)) {
                    $line = fgets($stream);
                    if ($line === false) continue;
                    
                    $line = trim($line);
                    if (str_starts_with($line, 'data: ')) {
                        $jsonStr = substr($line, 6);
                        if ($jsonStr === '[DONE]') continue;
                        $data = json_decode($jsonStr, true);
                        if ($data && isset($data['choices'][0]['delta']['content'])) {
                            echo "data: " . json_encode(['text' => $data['choices'][0]['delta']['content']]) . "\n\n";
                            ob_flush();
                            flush();
                        }
                    }
                }
            } else {
                $this->sendError("OpenAI API connection failed. Status: " . $response->status());
            }
        } catch (\Exception $e) {
            $this->sendError("OpenAI Stream Error: " . $e->getMessage());
        }
    }

    private function sendError(string $message): void
    {
        echo "data: " . json_encode(['text' => "\n\n[Error] " . $message]) . "\n\n";
        ob_flush();
        flush();
    }
}
