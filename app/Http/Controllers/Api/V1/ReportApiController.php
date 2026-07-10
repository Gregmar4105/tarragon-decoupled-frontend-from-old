<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportApiController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    protected function getRequestedDates(Request $request): array
    {
        $endDate = $request->filled('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
        $startDate = $request->filled('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subDays(6);

        return [$startDate, $endDate];
    }

    /**
     * Get report data for the given date range.
     */
    public function index(Request $request)
    {
        [$startDate, $endDate] = $this->getRequestedDates($request);
        $data = $this->reportService->compileReportData($startDate, $endDate);

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Export report data as CSV.
     */
    public function export(Request $request)
    {
        [$startDate, $endDate] = $this->getRequestedDates($request);
        $data = $this->reportService->compileReportData($startDate, $endDate);

        return $this->reportService->exportCsv($data);
    }
}
