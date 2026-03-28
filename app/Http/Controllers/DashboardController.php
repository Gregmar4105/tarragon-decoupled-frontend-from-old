<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Plan;
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

        // Active Bags (Currently dropped off)
        $capacity = 150;
        $activeBagsToday = \App\Models\BookingItem::whereHas('booking', function ($query) {
            $query->whereIn('status', ['dropped_off']);
        })->sum('quantity');

        // Estimate active bags yesterday for trend
        $activeBagsYesterday = \App\Models\BookingItem::whereHas('booking', function ($query) {
            $query->whereIn('status', ['dropped_off', 'completed'])
                  ->whereDate('drop_off_time', '<=', Carbon::yesterday())
                  ->where(function ($q) {
                      $q->whereNull('pick_up_time')
                        ->orWhereDate('pick_up_time', '>', Carbon::yesterday());
                  });
        })->sum('quantity');
        
        $activeBagsTrend = $activeBagsYesterday > 0 ? (($activeBagsToday - $activeBagsYesterday) / $activeBagsYesterday) * 100 : ($activeBagsToday > 0 ? 100 : 0);

        // Revenue Today (Only Paid Bookings)
        $revenueToday = Booking::whereDate('created_at', Carbon::today())
            ->where('payment_status', 'paid')
            ->sum('total_price');
            
        $revenueYesterday = Booking::whereDate('created_at', Carbon::today()->subDay())
            ->where('payment_status', 'paid')
            ->sum('total_price');
        $revenueTrend = $revenueYesterday > 0 ? (($revenueToday - $revenueYesterday) / $revenueYesterday) * 100 : ($revenueToday > 0 ? 100 : 0);
        
        // Avg Per Bag (from today's revenue and today's bags)
        $totalBagsToday = \App\Models\BookingItem::whereHas('booking', function ($query) {
            $query->whereDate('created_at', Carbon::today());
        })->sum('quantity');
        $avgRevenuePerBag = $totalBagsToday > 0 ? ($revenueToday / $totalBagsToday) : 0;

        // Check-ins (Bookings currently checked in)
        $checkinsToday = Booking::where('status', 'dropped_off')->count();
        
        $checkinsYesterday = Booking::whereIn('status', ['dropped_off', 'completed'])
            ->whereDate('drop_off_time', '<=', Carbon::yesterday())
            ->where(function ($q) {
                $q->whereNull('pick_up_time')
                  ->orWhereDate('pick_up_time', '>', Carbon::yesterday());
            })->count();
            
        $checkinsTrend = $checkinsYesterday > 0 ? (($checkinsToday - $checkinsYesterday) / $checkinsYesterday) * 100 : ($checkinsToday > 0 ? 100 : 0);
        $pendingCheckins = Booking::where('status', 'pending')->count();

        // Avg Duration (Exclude cancelled bookings)
        $durations = Booking::whereNotNull('drop_off_time')
            ->whereNotNull('pick_up_time')
            ->whereMonth('created_at', Carbon::now()->month)
            ->where('status', '!=', 'cancelled')
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

        // Fetch active pricing plan for the BookingModal
        $activePlan = Plan::where('is_active', true)->first();
        $pricing = $activePlan ? [
            'small'  => (float) $activePlan->price_small,
            'medium' => (float) $activePlan->price_medium,
            'large'  => (float) $activePlan->price_large,
            'plus'   => (float) $activePlan->price_plus,
        ] : ['small' => 10, 'medium' => 15, 'large' => 20, 'plus' => 25];

        return Inertia::render('dashboard', [
            'recentBookings' => $recentBookings,
            'recentSales'    => $recentSales,
            'stats'          => $stats,
            'pricing'        => $pricing,
        ]);
    }
}
