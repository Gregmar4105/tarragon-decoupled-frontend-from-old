<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    private \App\Services\LLMService $llmService;

    public function __construct(\App\Services\LLMService $llmService)
    {
        $this->llmService = $llmService;
    }

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

        // Optional: Save an image marker in chat history
        $chat = Chat::create([
            'session_id' => $sessionId,
            'user_id' => $userId,
            'sent_messages' => $image ? "[Image Attachment] " . $message : $message,
        ]);

        $settings = \App\Models\Setting::pluck('value', 'key');
        $aiProvider = $settings['ai_provider'] ?? 'ollama';
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

        $exchangeRate = 58;
        $now = now()->format('Y-m-d H:i:s (l)');
        $finalSystemPrompt = "System Identity:\n" . $aiSystemPrompt . "\n\n" .
            "Context: Current Server Time is " . $now . ".\n" .
            "Currency: All internal storage logic is in USD, but you must quote prices in PHP to the customer. " .
            "The exchange rate is 1 USD = " . $exchangeRate . " PHP.\n\n" .
            "Available Storage Pricing Plans (USD per cycle per bag):\n" . $pricingText . "\n\n" .
            "PROTOCOL:\n" .
            "1. You are here to book luggage storage. If you have the user's Name, Email, Phone, Dates, and Bag counts, give a FINAL summary table in PHP.\n" .
            "2. When the user confirms, you MUST IMMEDIATELY trigger the booking by outputting ONLY the tool block below.\n" .
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
            "Rule: You speak as a friendly human, but you are also a precise booking engine.";

        $messagesPayload = [];
        foreach ($chatHistoryLogs as $log) {
            if ($log->sent_messages) {
                $messagesPayload[] = ['role' => 'user', 'content' => $log->sent_messages];
            }
            if ($log->ai_response) {
                $messagesPayload[] = ['role' => 'assistant', 'content' => $log->ai_response];
            }
        }

        $base64Data = null;
        if ($image) {
            $base64Data = str_contains($image, ',') ? explode(',', $image)[1] : $image;
        }

        $userContent = $message;
        if ($image) {
            $userContent = [
                ['type' => 'text', 'text' => $message],
                ['type' => 'image_url', 'image_url' => ['url' => $image]]
            ];
        }
        $messagesPayload[] = ['role' => 'user', 'content' => $userContent];

        return response()->stream(function () use ($chat, $aiProvider, $aiEndpoint, $aiModel, $aiApiKey, $messagesPayload, $finalSystemPrompt) {
            
            $fullResponseLog = '';
            
            if ($aiEndpoint && $aiModel) {
            
                // Capture the stream to save to DB
                ob_start(function($chunk) use (&$fullResponseLog) {
                    if (str_starts_with($chunk, 'data: ')) {
                        $data = json_decode(substr($chunk, 6), true);
                        if (isset($data['text'])) {
                            $fullResponseLog .= $data['text'];
                        }
                    }
                    return $chunk;
                }, 1);

                $this->llmService->streamResponse(
                    $aiProvider,
                    $aiEndpoint,
                    $aiModel,
                    $aiApiKey,
                    $messagesPayload,
                    $finalSystemPrompt
                );
                
                ob_end_flush();

            } else {
                echo "data: " . json_encode(['text' => "AI configuration is missing. Please check Settings."]) . "\n\n";
            }

            $chat->update(['ai_response' => $fullResponseLog]);

        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }
}
