<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

$request = Illuminate\Http\Request::create('/bookings', 'POST', [
    'customer_name' => 'John Online',
    'customer_email' => 'online@example.com',
    'drop_off_time' => '2026-03-05 10:00:00',
    'pick_up_time' => '2026-03-05 14:00:00',
    'total_price' => 50,
    'items' => [
        'small' => 1,
        'medium' => 0,
        'large' => 0
    ],
    // 'source' is omitted, should default to online
]);

$controller = app(App\Http\Controllers\BookingController::class);

try {
    $response = $controller->store($request);
    
    // Check if redirect has errors
    $session = app('session')->driver();
    if ($session->has('errors')) {
        echo "Validation Errors:\n";
        print_r($session->get('errors')->all());
    } else {
        $booking = App\Models\Booking::latest()->first();
        echo "Booking Created!\n";
        echo "Name: " . $booking->customer_name . "\n";
        echo "Source in DB: " . $booking->source . "\n";
        echo "Success!\n";
    }

} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
