<?php

use App\Http\Controllers\Settings\AIAssistantController;
use App\Http\Controllers\Settings\EmailSettingsController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/ai-assistant', [AIAssistantController::class, 'edit'])->name('ai-assistant.edit');
    Route::patch('settings/ai-assistant', [AIAssistantController::class, 'update'])->name('ai-assistant.update');
    Route::post('settings/ai-assistant/test', [AIAssistantController::class, 'testConnection'])->name('ai-assistant.test');

    Route::get('settings/email', [EmailSettingsController::class, 'edit'])->name('email.edit');
    Route::patch('settings/email', [EmailSettingsController::class, 'update'])->name('email.update');
    Route::post('settings/email/test', [EmailSettingsController::class, 'testConnection'])->name('email.test');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
