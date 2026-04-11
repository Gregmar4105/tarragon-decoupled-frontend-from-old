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

        foreach ($bookings as $booking) {
            $dateKey = $booking->created_at->format('Y-m-d');
            if (isset($dailyBookings[$dateKey])) {
                $dailyBookings[$dateKey]['bookings'] += $booking->items->sum('quantity');
            }
        }

        $onlineCount = $this->repository->getBookingCountBySource($startDate, $endDate, 'online');
        $walkinCount = $this->repository->getBookingCountBySource($startDate, $endDate, 'walk-in');

        $sourceData = [
            ['name' => 'Online Booking', 'value' => $onlineCount],
            ['name' => 'Walk-ins', 'value' => $walkinCount],
        ];

        return [
            'dailyTrend' => array_values($dailyBookings),
            'sourceDistribution' => $sourceData
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
