<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\BookingApiController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PlanApiController;
use App\Http\Controllers\Api\V1\ReportApiController;
use App\Http\Controllers\Api\V1\TransactionApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/chat', [ChatController::class, 'sendMessage']);
Route::post('/bookings', [BookingApiController::class, 'store']);

// ─── Decoupled React Frontend API V1 routes ───────────────────────────
Route::prefix('v1')->group(function () {
    // Public guest routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/pricing-plans/public', [PlanApiController::class, 'publicIndex']);
    Route::post('/bookings/public', [App\Http\Controllers\Api\V1\BookingApiController::class, 'storePublic']);
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'debug' => (bool) config('app.debug'),
        ]);
    });

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/user/profile', [AuthController::class, 'updateProfile']);
        Route::put('/user/password', [AuthController::class, 'updatePassword']);

        // 2FA Security settings
        Route::post('/auth/two-factor/enable', [AuthController::class, 'enableTwoFactor']);
        Route::post('/auth/two-factor/confirm', [AuthController::class, 'confirmTwoFactor']);
        Route::delete('/auth/two-factor/disable', [AuthController::class, 'disableTwoFactor']);

        // Pricing Plans management
        Route::apiResource('pricing-plans', PlanApiController::class)->except(['show']);

        // Bookings management
        Route::get('/bookings', [App\Http\Controllers\Api\V1\BookingApiController::class, 'index']);
        Route::post('/bookings', [App\Http\Controllers\Api\V1\BookingApiController::class, 'store']);
        Route::put('/bookings/{booking}', [App\Http\Controllers\Api\V1\BookingApiController::class, 'update']);

        // Reports & Analytics management
        Route::get('/reports', [ReportApiController::class, 'index']);
        Route::get('/reports/export', [ReportApiController::class, 'export']);
        Route::get('/reports/activities', [ReportApiController::class, 'activities']);
        Route::post('/reports/ai-analyze', [AnalyticsController::class, 'analyze']);

        // Transactions management
        Route::get('/transactions', [TransactionApiController::class, 'index']);
        Route::get('/transactions/export', [TransactionApiController::class, 'export']);
    });
});
