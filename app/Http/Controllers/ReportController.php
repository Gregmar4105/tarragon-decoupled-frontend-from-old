<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Booking;
use App\Models\BookingItem;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // 1. Daily Bookings Trend (Last 7 days)
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(6);
        $period = CarbonPeriod::create($startDate, $endDate);
        
        $dailyBookings = [];
        foreach ($period as $date) {
            $formattedDate = $date->format('Y-m-d');
            $shortName = $date->format('D'); // Mon, Tue
            $dailyBookings[$formattedDate] = [
                'name' => $shortName,
                'bookings' => 0,
            ];
        }

        // Query bookings within the date range and sum their item quantities
        $bookings = Booking::with('items')
            ->whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()])
            ->get();

        foreach ($bookings as $booking) {
            $dateKey = $booking->created_at->format('Y-m-d');
            if (isset($dailyBookings[$dateKey])) {
                $dailyBookings[$dateKey]['bookings'] += $booking->items->sum('quantity');
            }
        }

        // 2. Source Pie Chart — use the 'source' column
        $onlineCount = Booking::where('source', 'online')->count();
        $walkinCount = Booking::where('source', 'walk-in')->count();

        $sourceData = [
            ['name' => 'Online Booking', 'value' => $onlineCount],
            ['name' => 'Walk-ins', 'value' => $walkinCount],
        ];

        return Inertia::render('reports/index', [
            'dailyTrend' => array_values($dailyBookings),
            'sourceDistribution' => $sourceData
        ]);
    }
}
