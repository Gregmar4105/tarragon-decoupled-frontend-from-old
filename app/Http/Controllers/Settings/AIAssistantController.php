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
    private \App\Services\LLMService $llmService;

    public function __construct(\App\Services\LLMService $llmService)
    {
        $this->llmService = $llmService;
    }

    /**
     * Show the AI Assistant settings page.
     */
    public function edit(): Response
    {
        $settings = [
            'ai_provider' => Setting::where('key', 'ai_provider')->value('value') ?? 'ollama',
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
            'ai_provider' => 'nullable|string|in:ollama,openai,gemini',
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
            'provider' => 'required|string|in:ollama,openai,gemini',
            'endpoint' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        try {
            $models = $this->llmService->fetchModels(
                $validated['provider'],
                $validated['endpoint'],
                $validated['api_key'] ?? ''
            );

            return response()->json(['models' => $models]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Connection test failed: ' . $e->getMessage()], 400);
        }
    }
}
