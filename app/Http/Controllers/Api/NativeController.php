<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Native\Mobile\Facades\PushNotifications;
use Native\Mobile\Facades\Biometrics;
use Native\Mobile\Facades\SecureStorage;
use App\Models\User;

class NativeController extends Controller
{
    // ─────────────────────────────────────────────
    //  PUSH NOTIFICATIONS (requires auth)
    // ─────────────────────────────────────────────

    /**
     * Request push notification permission and enrollment.
     * The native side will show the permission dialog. On approval,
     * a TokenGenerated event fires and is handled by NativeAppServiceProvider.
     */
    public function enrollNotifications()
    {
        PushNotifications::enroll()->id((string) auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Push notification enrollment initiated.',
        ]);
    }

    /**
     * Manually sync an FCM token (fallback if the event listener misses it).
     */
    public function updateToken(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        $request->user()->update(['fcm_token' => $request->token]);

        return response()->json([
            'success' => true,
            'message' => 'FCM token saved.',
        ]);
    }

    // ─────────────────────────────────────────────
    //  BIOMETRIC SETUP (requires auth)
    // ─────────────────────────────────────────────

    /**
     * Enable biometric login for the current user.
     *
     * Flow:
     * 1. Validate the user's current password (proves identity)
     * 2. Trigger the native fingerprint prompt (blocks until result)
     * 3. On success, store credentials in Android Keystore via SecureStorage
     */
    public function setupBiometrics(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        // Step 1: Verify password
        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password is incorrect.',
            ], 422);
        }

        // Step 2: Trigger native biometric prompt (synchronous — blocks until user responds)
        $biometricResult = Biometrics::prompt()->id('setup_biometrics')->prompt();

        if (! $biometricResult) {
            return response()->json([
                'success' => false,
                'message' => 'Biometric authentication failed or was cancelled.',
            ]);
        }

        // Step 3: Store credentials securely in the device keystore
        SecureStorage::set('biometric_email', $user->email);
        SecureStorage::set('biometric_password', $request->password);
        SecureStorage::set('biometric_enabled', 'true');

        Log::info("Biometric login enabled for user: {$user->email}");

        return response()->json([
            'success' => true,
            'message' => 'Fingerprint login has been enabled.',
        ]);
    }

    /**
     * Disable biometric login — clear stored credentials.
     */
    public function disableBiometrics()
    {
        SecureStorage::delete('biometric_email');
        SecureStorage::delete('biometric_password');
        SecureStorage::delete('biometric_enabled');

        return response()->json([
            'success' => true,
            'message' => 'Fingerprint login has been disabled.',
        ]);
    }

    // ─────────────────────────────────────────────
    //  BIOMETRIC LOGIN (NO auth — used on login page)
    // ─────────────────────────────────────────────

    /**
     * Check whether biometric login is available on this device.
     * Does NOT return credentials — only a boolean flag.
     */
    public function checkBiometrics()
    {
        $enabled = SecureStorage::get('biometric_enabled');
        $email = SecureStorage::get('biometric_email');

        return response()->json([
            'available' => $enabled === 'true' && ! empty($email),
        ]);
    }

    /**
     * Perform biometric login.
     *
     * Flow:
     * 1. Trigger native fingerprint prompt (blocks until result)
     * 2. On fingerprint success, retrieve credentials from SecureStorage
     * 3. Authenticate via Auth::attempt()
     * 4. Return redirect for Inertia to follow
     */
    public function biometricLogin(Request $request)
    {
        // Step 1: Check if biometric credentials exist
        $enabled = SecureStorage::get('biometric_enabled');
        if ($enabled !== 'true') {
            return response()->json([
                'success' => false,
                'message' => 'Biometric login is not set up on this device.',
            ], 400);
        }

        // Step 2: Trigger fingerprint prompt (synchronous)
        $biometricResult = Biometrics::prompt()->id('login_biometrics')->prompt();

        if (! $biometricResult) {
            return response()->json([
                'success' => false,
                'message' => 'Biometric authentication failed or was cancelled.',
            ]);
        }

        // Step 3: Retrieve stored credentials
        $email = SecureStorage::get('biometric_email');
        $password = SecureStorage::get('biometric_password');

        if (! $email || ! $password) {
            // Credentials were cleared — disable biometric flag
            SecureStorage::delete('biometric_enabled');

            return response()->json([
                'success' => false,
                'message' => 'Stored credentials not found. Please set up fingerprint login again.',
            ], 400);
        }

        // Step 4: Authenticate
        if (Auth::attempt(['email' => $email, 'password' => $password], true)) {
            $request->session()->regenerate();

            Log::info("Biometric login successful for: {$email}");

            return response()->json([
                'success' => true,
                'redirect' => '/dashboard',
            ]);
        }

        // Password was changed since setup — clear stored creds
        SecureStorage::delete('biometric_email');
        SecureStorage::delete('biometric_password');
        SecureStorage::delete('biometric_enabled');

        return response()->json([
            'success' => false,
            'message' => 'Stored credentials are no longer valid. Please set up fingerprint login again.',
        ], 401);
    }
}
