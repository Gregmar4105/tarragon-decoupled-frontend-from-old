<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\AnalyticsController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('welcome');

Route::get('login', function () {
    return Inertia::render('auth/login');
})->middleware('guest')->name('login');

Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');

Route::get('/pricing', function () {
    $plans = \App\Models\Plan::where('is_active', true)->get();
    return Inertia::render('pricing', [
        'plans' => $plans
    ]);
})->name('pricing');

Route::get('about', function () {
    return Inertia::render('about');
})->name('about');

Route::get('track', function () {
    return Inertia::render('track-booking');
})->name('track');

Route::get('confirmation/{id?}', function ($id = null) {
    return Inertia::render('confirmation', ['bookingId' => $id]);
})->name('confirmation');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('search', function () {
    return Inertia::render('search/index');
})->name('search');

Route::get('checkout', function () {
    return Inertia::render('checkout/index');
})->name('checkout');

Route::get('bookings/create', function () {
    $plan = \App\Models\Plan::where('is_active', true)->first();
    $pricing = $plan ? [
        'small' => (float) $plan->price_small,
        'medium' => (float) $plan->price_medium,
        'large' => (float) $plan->price_large,
        'plus' => (float) $plan->price_plus,
    ] : ['small' => 10, 'medium' => 15, 'large' => 20, 'plus' => 25];
    return Inertia::render('bookings/create', ['pricing' => $pricing]);
})->middleware(['auth', 'verified'])->name('bookings.create');

Route::post('notifications/{id}/read', function ($id) {
    auth()->user()->unreadNotifications->where('id', $id)->markAsRead();
    return back();
})->middleware(['auth', 'verified'])->name('notifications.read');

Route::post('notifications/read-all', function () {
    auth()->user()->unreadNotifications->markAsRead();
    return back();
})->middleware(['auth', 'verified'])->name('notifications.readAll');

Route::get('bookings/{booking}', [BookingController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('bookings.show');

Route::put('bookings/{booking}', [BookingController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('bookings.update');

Route::resource('plans', \App\Http\Controllers\PlanController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->middleware(['auth', 'verified']);

Route::get('bookings', [BookingController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('bookings');

Route::get('transactions/export', [TransactionController::class, 'export'])
    ->middleware(['auth', 'verified'])
    ->name('transactions.export');

Route::get('transactions', [TransactionController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('transactions');

Route::get('reports/export', [ReportController::class, 'export'])
    ->middleware(['auth', 'verified'])
    ->name('reports.export');

Route::get('reports', [ReportController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('reports');

Route::post('reports/ai-analyze', [AnalyticsController::class, 'analyze'])
    ->middleware(['auth', 'verified'])
    ->name('reports.ai-analyze');

Route::get('activity-logging', [\App\Http\Controllers\AuditTrailController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('activity-logging');

require __DIR__.'/settings.php';
