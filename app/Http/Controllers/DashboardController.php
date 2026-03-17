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
                'status' => ucfirst(str_replace(['dropped_off', 'completed', '_'], ['checked-in', 'checked-out', ' '], $booking->status)),
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

        // Active Bags
        $capacity = 150;
        $activeBookingsTodayQuery = Booking::whereIn('status', ['dropped_off']);
        $activeBagsToday = $activeBookingsTodayQuery->withCount(['items as total_bags' => function ($query) {
            $query->select(\Illuminate\Support\Facades\DB::raw('sum(quantity)'));
        }])->get()->sum('total_bags');

        $activeBookingsYesterdayQuery = Booking::whereIn('status', ['dropped_off'])->whereDate('created_at', '<', Carbon::today());
        $activeBagsYesterday = $activeBookingsYesterdayQuery->withCount(['items as total_bags' => function ($query) {
            $query->select(\Illuminate\Support\Facades\DB::raw('sum(quantity)'));
        }])->get()->sum('total_bags');
        
        $activeBagsTrend = $activeBagsYesterday > 0 ? (($activeBagsToday - $activeBagsYesterday) / $activeBagsYesterday) * 100 : ($activeBagsToday > 0 ? 100 : 0);

        // Revenue Today
        $revenueToday = Booking::whereDate('created_at', Carbon::today())->sum('total_price');
        $revenueYesterday = Booking::whereDate('created_at', Carbon::today()->subDay())->sum('total_price');
        $revenueTrend = $revenueYesterday > 0 ? (($revenueToday - $revenueYesterday) / $revenueYesterday) * 100 : ($revenueToday > 0 ? 100 : 0);
        $avgRevenuePerBag = $activeBagsToday > 0 ? ($revenueToday / $activeBagsToday) : 0;

        // Check-ins
        $checkinsToday = Booking::whereDate('drop_off_time', Carbon::today())
            ->whereIn('status', ['dropped_off', 'completed'])
            ->count();
        $checkinsYesterday = Booking::whereDate('drop_off_time', Carbon::today()->subDay())
            ->whereIn('status', ['dropped_off', 'completed'])
            ->count();
        $checkinsTrend = $checkinsYesterday > 0 ? (($checkinsToday - $checkinsYesterday) / $checkinsYesterday) * 100 : ($checkinsToday > 0 ? 100 : 0);
        $pendingCheckins = Booking::where('status', 'pending')->count();

        // Avg Duration
        $durations = Booking::whereNotNull('drop_off_time')
            ->whereNotNull('pick_up_time')
            ->whereMonth('created_at', Carbon::now()->month)
            ->get()
            ->map(function ($booking) {
                return Carbon::parse($booking->drop_off_time)->diffInHours(Carbon::parse($booking->pick_up_time));
            });
        $avgDuration = $durations->count() > 0 ? $durations->average() : 0;

        $stats = [
            'activeBags' => [
                'value' => (int) $activeBagsToday,
                'capacity' => $capacity,
                'trend' => round($activeBagsTrend),
            ],
            'revenue' => [
                'value' => (float) $revenueToday,
                'avgPerBag' => (float) $avgRevenuePerBag,
                'trend' => round($revenueTrend),
            ],
            'checkins' => [
                'value' => $checkinsToday,
                'pending' => $pendingCheckins,
                'trend' => round($checkinsTrend),
            ],
            'duration' => [
                'value' => round($avgDuration, 1),
            ],
        ];

        return Inertia::render('dashboard', [
            'recentBookings' => $recentBookings,
            'recentSales' => $recentSales,
            'stats' => $stats,
        ]);
    }
}
