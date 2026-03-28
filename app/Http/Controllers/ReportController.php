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
    private function getReportData(Request $request)
    {
        $endDate = $request->filled('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
        $startDate = $request->filled('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subDays(6);
        $period = CarbonPeriod::create($startDate, $endDate);
        
        $dailyBookings = [];
        foreach ($period as $date) {
            $formattedDate = $date->format('Y-m-d');
            $shortName = $date->format('D, M d'); 
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

        $onlineCount = Booking::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->where('source', 'online')->count();
        $walkinCount = Booking::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->where('source', 'walk-in')->count();

        $sourceData = [
            ['name' => 'Online Booking', 'value' => $onlineCount],
            ['name' => 'Walk-ins', 'value' => $walkinCount],
        ];

        return [
            'dailyTrend' => array_values($dailyBookings),
            'sourceDistribution' => $sourceData
        ];
    }

    public function index(Request $request)
    {
        $data = $this->getReportData($request);

        return Inertia::render('reports/index', [
            'dailyTrend' => $data['dailyTrend'],
            'sourceDistribution' => $data['sourceDistribution'],
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }

    public function export(Request $request)
    {
        $data = $this->getReportData($request);
        
        $response = new \Symfony\Component\HttpFoundation\StreamedResponse(function () use ($data) {
            $handle = fopen('php://output', 'w');
            
            fputcsv($handle, ['Daily Bookings Trend']);
            fputcsv($handle, ['Date', 'Bags Stored']);
            foreach ($data['dailyTrend'] as $trend) {
                fputcsv($handle, [$trend['name'], $trend['bookings']]);
            }
            
            fputcsv($handle, []);
            
            fputcsv($handle, ['Booking Sources']);
            fputcsv($handle, ['Source', 'Count']);
            foreach ($data['sourceDistribution'] as $source) {
                fputcsv($handle, [$source['name'], $source['value']]);
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="reports_export.csv"');

        return $response;
    }
}
