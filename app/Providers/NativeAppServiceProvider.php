<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Native\Mobile\Events\PushNotification\TokenGenerated;
use Native\Mobile\Events\Biometric\Completed as BiometricCompleted;

class NativeAppServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // ─────────────────────────────────────────
        //  FCM Token Sync
        // ─────────────────────────────────────────
        // When the native side generates an FCM push token after enrollment,
        // this event fires. We save it to the authenticated user's record.
        Event::listen(TokenGenerated::class, function (TokenGenerated $event) {
            Log::info('NativePHP: FCM token generated', [
                'token' => substr($event->token, 0, 20) . '...',
                'id' => $event->id,
            ]);

            // The event is fired from an API webhook without session state,
            // so auth()->user() is null. We use the ID passed from the frontend.
            $user = \App\Models\User::find($event->id);

            if ($user) {
                $user->update(['fcm_token' => $event->token]);
                Log::info('NativePHP: FCM token saved for user #' . $user->id);
            } else {
                Log::warning('NativePHP: Could not save FCM token, user not found for ID: ' . $event->id);
            }
        });

        // ─────────────────────────────────────────
        //  Biometric Completion (event-based)
        // ─────────────────────────────────────────
        // This fires after the native biometric dialog resolves.
        // We log it for debugging. The actual logic is handled synchronously
        // inside NativeController (prompt() blocks until result).
        Event::listen(BiometricCompleted::class, function (BiometricCompleted $event) {
            Log::info('NativePHP: Biometric completed', [
                'success' => $event->success,
                'id' => $event->id,
            ]);
        });
    }
}
