<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class AIAssistantController extends Controller
{
    /**
     * Show the AI Assistant settings page.
     */
    public function edit(): Response
    {
        $settings = [
            'ai_api_endpoint' => Setting::where('key', 'ai_api_endpoint')->value('value') ?? '',
            'ai_model' => Setting::where('key', 'ai_model')->value('value') ?? '',
            'ai_api_key' => Setting::where('key', 'ai_api_key')->value('value') ?? '',
            'ai_system_prompt' => Setting::where('key', 'ai_system_prompt')->value('value') ?? "You are the Tarragon Assistant, a helpful AI focused on supporting customers with bookings, pricing, and info.",
        ];

        return Inertia::render('settings/ai-assistant', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the AI Assistant settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ai_api_endpoint' => 'nullable|url',
            'ai_model' => 'nullable|string|max:255',
            'ai_api_key' => 'nullable|string|max:255',
            'ai_system_prompt' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '']
            );
        }

        return redirect()->route('ai-assistant.edit')->with('status', 'settings-updated');
    }

    /**
     * Test Connection & Fetch Models
     */
    public function testConnection(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        $endpoint = rtrim($validated['endpoint'], '/');
        $apiKey = $validated['api_key'] ?? '';

        try {
            $isOllama = str_contains($endpoint, '11434') || str_contains($endpoint, '/api/') || preg_match('/localhost|127\.0\.0\.1/', $endpoint);

            if ($isOllama) {
                $parsed = parse_url($endpoint);
                $baseUrl = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost') . (!empty($parsed['port']) ? ':' . $parsed['port'] : '');
                
                $response = Http::timeout(5)->get($baseUrl . '/api/tags');
                if ($response->successful()) {
                    $models = collect($response->json('models', []))->pluck('name');
                    return response()->json(['models' => $models]);
                }
                return response()->json(['error' => 'Failed to reach Ollama tags endpoint. Response code: ' . $response->status()], 400);
            } else {
                $parsed = parse_url($endpoint);
                $baseUrl = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
                if (!empty($parsed['port'])) {
                    $baseUrl .= ':' . $parsed['port'];
                }

                $headers = [];
                if ($apiKey) {
                    $headers['Authorization'] = 'Bearer ' . $apiKey;
                }

                $response = Http::withHeaders($headers)->timeout(5)->get($baseUrl . '/v1/models');
                if ($response->successful()) {
                    $models = collect($response->json('data', []))->pluck('id');
                    return response()->json(['models' => $models]);
                }
                return response()->json(['error' => 'Failed to reach /v1/models endpoint. Status: ' . $response->status()], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Connection test failed: ' . $e->getMessage()], 400);
        }
    }
}
