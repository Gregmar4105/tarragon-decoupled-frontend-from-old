<?php

namespace App\Services;

use App\Repositories\ReportRepository;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    private ReportRepository $repository;

    public function __construct(ReportRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Compile report data including daily trend and source distribution.
     */
    public function compileReportData(Carbon $startDate, Carbon $endDate): array
    {
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

        $bookings = $this->repository->getBookingsWithinRange($startDate, $endDate);

        $totalRevenue = 0;
        $totalBags = 0;
        $totalBookings = $bookings->count();

        foreach ($bookings as $booking) {
            $dateKey = $booking->created_at->format('Y-m-d');
            $bookingBags = $booking->items->sum('quantity');
            
            if (isset($dailyBookings[$dateKey])) {
                $dailyBookings[$dateKey]['bookings'] += $bookingBags;
            }

            $totalRevenue += $booking->total_price;
            $totalBags += $bookingBags;
        }

        $onlineCount = $this->repository->getBookingCountBySource($startDate, $endDate, 'online');
        $walkinCount = $this->repository->getBookingCountBySource($startDate, $endDate, 'walk-in');

        $sourceData = [
            ['name' => 'Online Booking', 'value' => $onlineCount],
            ['name' => 'Walk-ins', 'value' => $walkinCount],
        ];

        return [
            'dailyTrend' => array_values($dailyBookings),
            'sourceDistribution' => $sourceData,
            'summary' => [
                'totalBookings' => $totalBookings,
                'totalBags' => $totalBags,
                'totalRevenue' => $totalRevenue,
                'avgBookingValue' => $totalBookings > 0 ? $totalRevenue / $totalBookings : 0,
            ],
            'recentBookings' => $bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'reference' => $booking->booking_reference,
                    'customer_name' => $booking->customer_name,
                    'customer_email' => $booking->customer_email,
                    'customer_phone' => $booking->customer_phone,
                    'total_price' => $booking->total_price,
                    'status' => $booking->status,
                    'source' => $booking->source,
                    'created_at' => $booking->created_at->format('Y-m-d H:i'),
                    'bags' => $booking->items->sum('quantity'),
                ];
            })
        ];
    }

    /**
     * Export Compiled Report Data to CSV.
     */
    public function exportCsv(array $data): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($data) {
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
