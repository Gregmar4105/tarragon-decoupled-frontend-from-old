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
        // Remove PHP's default 30-second execution time limit.
        // n8n AI agents (especially for booking flows) can take 60-120 seconds.
        set_time_limit(0);

        $request->validate([
            'message' => 'required|string',
            'session_id' => 'required|string',
        ]);

        $message = $request->input('message');
        $sessionId = $request->input('session_id');
        $userId = auth('sanctum')->id();

        // Save the user message to the database
        $chat = Chat::create([
            'session_id' => $sessionId,
            'user_id' => $userId,
            'sent_messages' => $message,
        ]);

        $webhookUrl = config('services.n8n.webhook_url');

        if (!$webhookUrl) {
            Log::error('N8N_WEBHOOK_URL is missing.');
            return response()->json([
                'reply' => "I'm sorry, my AI backend is not configured correctly. Please contact support."
            ], 500);
        }

        try {
            // Fetch live dynamic pricing from the database to give the AI context
            $activePlans = \App\Models\Plan::where('is_active', true)
                ->get(['name', 'billing_cycle', 'price', 'price_small', 'price_medium', 'price_large', 'price_plus'])
                ->toArray();

            // Fetch chat history for stateless AI memory
            $chatHistory = \App\Models\Chat::where('session_id', $sessionId)
                ->where('id', '!=', $chat->id)
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get()
                ->reverse()
                ->map(function ($msg) {
                    return "Customer: " . $msg->sent_messages . "\nAssistant: " . $msg->ai_response;
                })->implode("\n\n");

            // Forward the message to n8n Webhook.
            // Timeout set to 120 seconds — AI booking agents can take 60-90s.
            $response = Http::timeout(120)->post($webhookUrl, [
                'session_id' => $sessionId,
                'message' => $message,
                'system_context' => [
                    'live_pricing' => $activePlans,
                    'chat_history' => $chatHistory
                ]
            ]);

            if ($response->successful()) {
                $n8nData = $response->json();
                // Usually n8n webhooks return {'reply': '...', ...} or array. We handle accordingly
                $reply = '';
                if (isset($n8nData['reply']) && !empty(trim($n8nData['reply']))) {
                    $reply = $n8nData['reply'];
                } elseif (isset($n8nData['output']) && !empty(trim($n8nData['output']))) {
                    $reply = $n8nData['output'];
                } elseif (is_array($n8nData) && isset($n8nData[0]['reply'])) {
                    $reply = $n8nData[0]['reply'];
                } elseif (is_array($n8nData) && isset($n8nData[0]) && is_string($n8nData[0])) {
                    $reply = $n8nData[0];
                }

                if (empty(trim($reply))) {
                    $reply = "I successfully connected to n8n, but the response was empty. Please check your n8n workflow output format.";
                }

                // Intercept BOOKING_DATA for tool-less booking execution
                if (preg_match('/<BOOKING_DATA>(.*?)<\/BOOKING_DATA>/s', $reply, $matches)) {
                    $jsonStr = $matches[1];
                    $data = json_decode($jsonStr, true);
                    if (is_array($data)) {
                        $bookingRequest = new \Illuminate\Http\Request();
                        $bookingRequest->replace($data);
                        $bookingResponse = app(\App\Http\Controllers\Api\BookingApiController::class)->store($bookingRequest);
                        
                        $result = json_decode($bookingResponse->getContent(), true);
                        if (isset($result['success']) && $result['success']) {
                            $reply = preg_replace('/<BOOKING_DATA>.*?<\/BOOKING_DATA>/s', "\n\n🎉 **Your booking is perfectly confirmed!** Your official Booking Reference Number is: **" . $result['booking_reference'] . "**.", $reply);
                        } else {
                            $reply = preg_replace('/<BOOKING_DATA>.*?<\/BOOKING_DATA>/s', "\n\n⚠️ **Booking Attempt Failed:** " . ($result['error'] ?? 'Unknown Internal Error'), $reply);
                        }
                    } else {
                        $reply = preg_replace('/<BOOKING_DATA>.*?<\/BOOKING_DATA>/s', "\n\n⚠️ **Booking Attempt Failed:** The AI generated malformed data.", $reply);
                    }
                }

                // Update the chat record with AI response
                $chat->update([
                    'ai_response' => $reply,
                ]);

                return response()->json([
                    'reply' => $reply,
                ]);
            } else {
                Log::error('n8n Webhook responded with error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json([
                    'reply' => "I'm sorry, I couldn't reach the AI service right now."
                ], 502);
            }
        } catch (\Exception $e) {
            Log::error('Exception calling n8n webhook: ' . $e->getMessage());
            return response()->json([
                'reply' => "An unexpected error occurred while communicating with the AI service. Reason: " . $e->getMessage()
            ], 500);
        }
    }
}
