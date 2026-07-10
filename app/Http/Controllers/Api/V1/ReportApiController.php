<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditTrail;
use App\Models\Booking;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
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

    /**
     * Get recent activities/audit logs.
     */
    public function activities(Request $request): JsonResponse
    {
        $logs = AuditTrail::with(['auditable'])->latest('id')->limit(15)->get();

        foreach ($logs as $log) {
            if ($log->auditable instanceof Transaction) {
                $log->auditable->load('booking');
            } elseif ($log->auditable instanceof Booking) {
                $log->auditable->load('items');
            }
        }

        $formatted = $logs->map(function ($log) {
            $data = [
                'id' => $log->id,
                'user_name' => $log->user_name,
                'event' => $log->event,
                'activity' => $log->activity,
                'created_at' => $log->created_at->toIso8601String(),
                'ip_address' => $log->ip_address,
                'type' => class_basename($log->auditable_type),
            ];

            if ($log->auditable instanceof Booking) {
                $data['booking_reference'] = $log->auditable->booking_reference;
                $data['customer_name'] = $log->auditable->customer_name;
                $data['bags'] = (int) $log->auditable->items->sum('quantity');
                $data['status'] = $log->auditable->status;
            } elseif ($log->auditable instanceof Transaction) {
                $data['transaction_reference'] = $log->auditable->transaction_reference;
                $data['amount'] = (float) $log->auditable->amount;
                $data['payment_method'] = $log->auditable->payment_method;
                $data['status'] = $log->auditable->status;
                if ($log->auditable->booking) {
                    $data['customer_name'] = $log->auditable->booking->customer_name;
                    $data['booking_reference'] = $log->auditable->booking->booking_reference;
                }
            } elseif ($log->auditable instanceof User) {
                $data['target_user_name'] = $log->auditable->name;
            }

            return $data;
        });

        return response()->json([
            'data' => $formatted,
        ]);
    }
}
