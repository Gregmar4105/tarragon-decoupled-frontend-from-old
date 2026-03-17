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
        // 1. Daily Bookings Trend (Last 7 days for simplicity, can be 30)
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

        $itemsTrend = BookingItem::whereHas('booking', function($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()]);
        })->get();

        foreach ($itemsTrend as $item) {
            $dateKey = $item->created_at->format('Y-m-d');
            if (isset($dailyBookings[$dateKey])) {
                $dailyBookings[$dateKey]['bookings'] += $item->quantity;
            }
        }

        // 2. Source Pie Chart
        $onlineCount = Booking::whereNotNull('user_id')->count();
        $walkinCount = Booking::whereNull('user_id')->count();

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
