<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

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

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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

Route::get('bookings', function () {
    return Inertia::render('bookings/index');
})->middleware(['auth', 'verified'])->name('bookings');

Route::get('transactions', function () {
    return Inertia::render('transactions/index');
})->middleware(['auth', 'verified'])->name('transactions');

Route::get('reports', function () {
    return Inertia::render('reports/index');
})->middleware(['auth', 'verified'])->name('reports');

require __DIR__.'/settings.php';
