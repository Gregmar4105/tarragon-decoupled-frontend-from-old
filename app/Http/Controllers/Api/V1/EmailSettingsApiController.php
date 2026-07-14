<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class EmailSettingsApiController extends Controller
{
    /**
     * Get the Email settings.
     */
    public function show(): JsonResponse
    {
        $settings = [
            'mail_host' => Setting::where('key', 'mail_host')->value('value') ?? config('mail.mailers.smtp.host'),
            'mail_port' => Setting::where('key', 'mail_port')->value('value') ?? config('mail.mailers.smtp.port'),
            'mail_username' => Setting::where('key', 'mail_username')->value('value') ?? config('mail.mailers.smtp.username'),
            'mail_password' => Setting::where('key', 'mail_password')->value('value') ?? config('mail.mailers.smtp.password'),
            'mail_encryption' => Setting::where('key', 'mail_encryption')->value('value') ?? config('mail.mailers.smtp.encryption'),
            'mail_from_address' => Setting::where('key', 'mail_from_address')->value('value') ?? config('mail.from.address'),
            'mail_from_name' => Setting::where('key', 'mail_from_name')->value('value') ?? config('mail.from.name'),
        ];

        return response()->json([
            'settings' => $settings,
        ]);
    }

    /**
     * Update the Email settings.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mail_host' => 'nullable|string|max:255',
            'mail_port' => 'nullable|string|max:10',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|max:20',
            'mail_from_address' => 'nullable|email|max:255',
            'mail_from_name' => 'nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '']
            );
        }

        return response()->json([
            'message' => 'Email settings updated successfully',
        ]);
    }

    /**
     * Test SMTP Connection
     */
    public function testConnection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mail_host' => 'required|string',
            'mail_port' => 'required',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'nullable|string',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string',
        ]);

        try {
            // Backup current config
            $backup = config('mail');

            // Set temporary config
            Config::set('mail.mailers.smtp.host', $validated['mail_host']);
            Config::set('mail.mailers.smtp.port', $validated['mail_port']);
            Config::set('mail.mailers.smtp.username', $validated['mail_username']);
            Config::set('mail.mailers.smtp.password', $validated['mail_password']);
            Config::set('mail.mailers.smtp.encryption', $validated['mail_encryption']);
            Config::set('mail.from.address', $validated['mail_from_address']);
            Config::set('mail.from.name', $validated['mail_from_name']);

            // Attempt to send a test email to the current user
            $user = $request->user();

            Mail::raw('This is a test email to verify your SMTP settings for Tarragon.', function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Tarragon SMTP Test');
            });

            // Restore config
            Config::set('mail', $backup);

            return response()->json([
                'success' => true,
                'message' => 'Successfully sent a test email to '.$user->email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send test email: '.$e->getMessage(),
            ], 400);
        }
    }
}
