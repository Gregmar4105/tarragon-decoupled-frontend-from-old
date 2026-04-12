<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        set_time_limit(0);

        $request->validate([
            'message' => 'required|string',
            'session_id' => 'required|string',
            'image' => 'nullable|string', // Base64 Data URI
        ]);

        $message = $request->input('message');
        $sessionId = $request->input('session_id');
        $image = $request->input('image');
        $userId = auth('sanctum')->id();

        // Optional: Save an image marker in chat history but avoid saving massive base64 in DB to prevent bloat
        $chat = Chat::create([
            'session_id' => $sessionId,
            'user_id' => $userId,
            'sent_messages' => $image ? "[Image Attachment] " . $message : $message,
        ]);

        $settings = \App\Models\Setting::pluck('value', 'key');
        $aiEndpoint = rtrim($settings['ai_api_endpoint'] ?? '', '/');
        $aiModel = $settings['ai_model'] ?? '';
        $aiApiKey = $settings['ai_api_key'] ?? '';
        $aiSystemPrompt = $settings['ai_system_prompt'] ?? "You are the Tarragon Assistant, a helpful AI focused on customer support.";

        $activePlans = \App\Models\Plan::where('is_active', true)
            ->get(['name', 'billing_cycle', 'price', 'price_small', 'price_medium', 'price_large', 'price_plus'])
            ->toArray();

        $chatHistoryLogs = \App\Models\Chat::where('session_id', $sessionId)
            ->where('id', '!=', $chat->id)
            ->orderBy('created_at', 'desc')
            ->take(30)
            ->get()
            ->reverse();

        $pricingText = collect($activePlans)->map(function($plan) {
            return "- {$plan['name']} ({$plan['billing_cycle']}): Small \${$plan['price_small']}, Medium \${$plan['price_medium']}, Large \${$plan['price_large']}, Plus \${$plan['price_plus']}";
        })->implode("\n");

        $exchangeRate = 58; // Hardcoded for now to match UI, should be dynamic if possible
        $now = now()->format('Y-m-d H:i:s (l)');
        $finalSystemPrompt = "System Identity:\n" . $aiSystemPrompt . "\n\n" .
            "Context: Current Server Time is " . $now . ".\n" .
            "Currency: All internal storage logic is in USD, but you must quote prices in PHP to the customer. " .
            "The exchange rate is 1 USD = " . $exchangeRate . " PHP.\n\n" .
            "Available Storage Pricing Plans (USD per cycle per bag):\n" . $pricingText . "\n\n" .
            "PROTOCOL:\n" .
            "1. You are here to book luggage storage. If you have the user's Name, Email, Phone, Dates, and Bag counts, give a FINAL summary table in PHP.\n" .
            "2. When the user confirms (e.g., 'yes', 'confirm', 'process'), you MUST IMMEDIATELY trigger the booking by outputting ONLY the tool block below. DO NOT ask more questions.\n" .
            "\n<BOOKING_TOOL>\n" .
            "{\n" .
            "  \"customer_name\": \"...\",\n" .
            "  \"customer_email\": \"...\",\n" .
            "  \"customer_phone\": \"...\",\n" .
            "  \"drop_off_time\": \"YYYY-MM-DD HH:MM\",\n" .
            "  \"pick_up_time\": \"YYYY-MM-DD HH:MM\",\n" .
            "  \"billing_cycle\": \"daily\",\n" .
            "  \"bags\": {\"small\": 0, \"medium\": 0, \"large\": 0, \"plus\": 0}\n" .
            "}\n" .
            "</BOOKING_TOOL>\n" .
            "CRITICAL: Never use text like 'N/A' or 'TBA' inside the JSON values. Use valid YYYY-MM-DD HH:MM formats only.\n" .
            "CRITICAL: Prices shown to customers MUST be in PHP (example: Small bag is ₱290).\n\n" .
            "Rule: You speak as a friendly human, but you are also a precise booking engine. When the deal is done, run the tool.";

        $messagesPayload = [];

        foreach ($chatHistoryLogs as $log) {
            if ($log->sent_messages) {
                $messagesPayload[] = ['role' => 'user', 'content' => $log->sent_messages];
            }
            if ($log->ai_response) {
                $messagesPayload[] = ['role' => 'assistant', 'content' => $log->ai_response];
            }
        }

        $currentMessageWithInstruction = $finalSystemPrompt . "Customer Message: " . $message;

        $base64Data = null;
        if ($image) {
            $base64Data = str_contains($image, ',') ? explode(',', $image)[1] : $image;
        }

        // Return a Streamed Response
        return response()->stream(function () use ($chat, $aiEndpoint, $aiModel, $aiApiKey, $message, $base64Data, $finalSystemPrompt, $activePlans, $chatHistoryLogs, $messagesPayload, $sessionId, $currentMessageWithInstruction) {
            
            $fullResponseLog = ''; // To eventually save back to `ai_response` in DB

            if ($aiEndpoint) {
                $isOllama = str_contains($aiEndpoint, '11434') || str_contains($aiEndpoint, '/api/') || preg_match('/localhost|127\.0\.0\.1/', $aiEndpoint);

                if ($isOllama) {
                    $parsed = parse_url($aiEndpoint);
                    $baseUrl = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost') . (!empty($parsed['port']) ? ':' . $parsed['port'] : '');
                    $chatUrl = $baseUrl . '/api/chat';

                    // Use a proper System Message for instructions
                    $ollamaPayload = [];
                    $ollamaPayload[] = ['role' => 'system', 'content' => $finalSystemPrompt];
                    
                    // Add History
                    foreach ($messagesPayload as $msg) {
                        $ollamaPayload[] = $msg;
                    }

                    // Add Active Message
                    $userMsg = ['role' => 'user', 'content' => $message];
                    if ($base64Data) {
                        $userMsg['images'] = [$base64Data];
                    }
                    $ollamaPayload[] = $userMsg;

                    try {
                        $response = Http::timeout(120)->withOptions(['stream' => true])->post($chatUrl, [
                            'model' => $aiModel,
                            'messages' => $ollamaPayload,
                            'stream' => true,
                        ]);

                        if ($response->successful()) {
                            $stream = $response->toPsrResponse()->getBody()->detach();

                            while (!feof($stream)) {
                                $line = fgets($stream);
                                if ($line === false || empty(trim($line))) continue;

                                $data = json_decode($line, true);
                                if ($data && isset($data['message']['content'])) {
                                    $content = $data['message']['content'];
                                    $fullResponseLog .= $content;
                                    echo "data: " . json_encode(['text' => $content]) . "\n\n";
                                    ob_flush();
                                    flush();
                                }
                            }
                        } else {
                            $err = "Ollama connection failed. Model may be missing.";
                            $fullResponseLog = $err;
                            echo "data: " . json_encode(['text' => $err]) . "\n\n";
                        }
                    } catch (\Exception $e) {
                        $err = "Ollama Stream Error: " . $e->getMessage();
                        $fullResponseLog = $err;
                        echo "data: " . json_encode(['text' => "\n\n" . $err]) . "\n\n";
                    }

                } else {
                    // Open-AI Compatible
                    $parsed = parse_url($aiEndpoint);
                    $baseUrl = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
                    if (!empty($parsed['port'])) {
                        $baseUrl .= ':' . $parsed['port'];
                    }
                    $chatUrl = rtrim($baseUrl, '/') . '/v1/chat/completions';

                    $headers = [];
                    if ($aiApiKey) {
                        $headers['Authorization'] = 'Bearer ' . $aiApiKey;
                    }

                    $openAiPayload = [];
                    $openAiPayload[] = ['role' => 'system', 'content' => $finalSystemPrompt];

                    // Add History
                    foreach ($messagesPayload as $msg) {
                        $openAiPayload[] = $msg;
                    }

                    // Add Active Message
                    $userContent = $message;
                    if ($base64Data) {
                        $userContent = [
                            ['type' => 'text', 'text' => $message],
                            ['type' => 'image_url', 'image_url' => ['url' => "data:image/jpeg;base64,{$base64Data}"]]
                        ];
                    }
                    $openAiPayload[] = ['role' => 'user', 'content' => $userContent];

                    try {
                        $response = Http::withHeaders($headers)
                            ->timeout(120)
                            ->withOptions(['stream' => true])
                            ->post($chatUrl, [
                                'model' => $aiModel,
                                'messages' => $openAiPayload,
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
                                        $content = $data['choices'][0]['delta']['content'];
                                        $fullResponseLog .= $content;
                                        echo "data: " . json_encode(['text' => $content]) . "\n\n";
                                        ob_flush();
                                        flush();
                                    }
                                }
                            }
                        } else {
                            $err = "AI API connection failed. Please check endpoint/key.";
                            $fullResponseLog = $err;
                            echo "data: " . json_encode(['text' => $err]) . "\n\n";
                        }
                    } catch (\Exception $e) {
                        $err = "AI Stream Error: " . $e->getMessage();
                        $fullResponseLog = $err;
                        echo "data: " . json_encode(['text' => "\n\n" . $err]) . "\n\n";
                    }
                }
            } else {
                // Fallback n8n sync to stream conversion
                $webhookUrl = config('services.n8n.webhook_url');
                if ($webhookUrl) {
                    try {
                        $response = Http::timeout(120)->post($webhookUrl, [
                            'session_id' => $sessionId,
                            'message' => $message,
                            'image' => $base64Data, // n8n might not support it natively without custom parsing
                            'system_context' => [
                                'live_pricing' => $activePlans,
                                'chat_history' => $messagesPayload // Sends array structure now
                            ]
                        ]);
                        if ($response->successful()) {
                            $n8nData = $response->json();
                            $reply = $n8nData['reply'] ?? $n8nData['output'] ?? $n8nData[0]['reply'] ?? $n8nData[0] ?? '';
                            $fullResponseLog = $reply;
                            echo "data: " . json_encode(['text' => $reply]) . "\n\n";
                        } else {
                            $err = "Internal fallback AI error.";
                            $fullResponseLog = $err;
                            echo "data: " . json_encode(['text' => $err]) . "\n\n";
                        }
                    } catch (\Exception $e) {
                        $err = "N8n Webhook Error: " . $e->getMessage();
                        $fullResponseLog = $err;
                        echo "data: " . json_encode(['text' => $err]) . "\n\n";
                    }
                } else {
                    $err = "No AI Endpoints are properly configured.";
                    $fullResponseLog = $err;
                    echo "data: " . json_encode(['text' => $err]) . "\n\n";
                }
            }

            // Save the compiled final text to database for history mapping later
            $chat->update(['ai_response' => $fullResponseLog]);

        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }
}
