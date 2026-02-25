<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Recent bookings (last 5)
        $bookings = Booking::with('transactions')->orderBy('created_at', 'desc')->take(5)->get();

        $recentBookings = $bookings->map(function ($booking) {
            $transaction = $booking->transactions->first();
            return [
                'id' => $booking->booking_reference,
                'customer' => $booking->customer_name,
                'status' => ucfirst(str_replace('_', ' ', $booking->status)),
                'payment' => $transaction ? ucfirst($transaction->payment_method) : 'N/A',
                'transactionId' => $transaction ? $transaction->transaction_reference : 'N/A',
            ];
        });

        // Recent sales overview matching the dashboard component structure
        $recentSales = $bookings->map(function ($booking) {
            return [
                'name' => $booking->customer_name,
                'email' => $booking->customer_email ?? 'No email provided',
                'amount' => (float) $booking->total_price,
            ];
        });

        return Inertia::render('dashboard', [
            'recentBookings' => $recentBookings,
            'recentSales' => $recentSales,
        ]);
    }
}
