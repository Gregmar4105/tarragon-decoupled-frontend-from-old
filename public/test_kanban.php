<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

$booking = App\Models\Booking::first();
echo "Before status: " . $booking->status . "\n";

$request = Illuminate\Http\Request::create('/bookings/' . $booking->booking_reference, 'PUT', [
    'status' => 'checked-in'
]);

// Bypass auth middleware for raw test
$controller = app(App\Http\Controllers\BookingController::class);

try {
    $response = $controller->update($request, $booking);
    
    // Refresh booking
    $booking->refresh();
    echo "After status: " . $booking->status . "\n";
    
    // Check if redirect has errors
    $session = app('session')->driver();
    if ($session->has('errors')) {
        echo "Validation Errors:\n";
        print_r($session->get('errors')->all());
    } else {
        echo "No validation errors. Success!\n";
    }

} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
