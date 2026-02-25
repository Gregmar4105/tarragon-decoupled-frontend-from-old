<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');

Route::get('pricing', function () {
    return Inertia::render('pricing');
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
    return Inertia::render('bookings/create');
})->middleware(['auth', 'verified'])->name('bookings.create');

Route::get('bookings/{id}', function ($id) {
    return Inertia::render('bookings/show', ['bookingId' => $id]);
})->middleware(['auth', 'verified'])->name('bookings.show');

Route::put('bookings/{booking}', [BookingController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('bookings.update');

Route::get('bookings', [BookingController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('bookings');

Route::get('transactions', [TransactionController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('transactions');

Route::get('reports', [ReportController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('reports');

require __DIR__.'/settings.php';
