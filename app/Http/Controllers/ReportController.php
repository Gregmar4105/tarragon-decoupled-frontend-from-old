<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ReportService;
use Carbon\Carbon;

class ReportController extends Controller
{
    private ReportService $service;

    public function __construct(ReportService $service)
    {
        $this->service = $service;
    }

    private function getRequestedDates(Request $request): array
    {
        $endDate = $request->filled('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
        $startDate = $request->filled('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subDays(6);
        
        return [$startDate, $endDate];
    }

    public function index(Request $request)
    {
        [$startDate, $endDate] = $this->getRequestedDates($request);
        $data = $this->service->compileReportData($startDate, $endDate);

        return Inertia::render('reports/index', [
            'dailyTrend' => $data['dailyTrend'],
            'sourceDistribution' => $data['sourceDistribution'],
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }

    public function export(Request $request)
    {
        [$startDate, $endDate] = $this->getRequestedDates($request);
        $data = $this->service->compileReportData($startDate, $endDate);
        
        return $this->service->exportCsv($data);
    }
}
