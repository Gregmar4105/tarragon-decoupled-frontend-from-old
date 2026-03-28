<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use Carbon\Carbon;

class TransactionController extends Controller
{
    private function buildQuery(Request $request)
    {
        $query = Transaction::with('booking')->latest();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        if ($request->filled('source') && $request->input('source') !== 'all') {
            $source = $request->input('source');
            $query->whereHas('booking', function ($q) use ($source) {
                // $source should match the exact value from frontend ("online" or "walk-in")
                $q->where('source', $source);
            });
        }

        if ($request->filled('method') && $request->input('method') !== 'all') {
            $query->where('payment_method', $request->input('method'));
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = $this->buildQuery($request);

        // Keep a clone for stats calculation
        $statsQuery = (clone $query)->whereHas('booking', function ($q) {
            $q->where('payment_status', 'paid');
        });

        $transactionsData = $query->get()->map(function ($txn) {
            return [
                'id' => $txn->transaction_reference,
                'date' => Carbon::parse($txn->created_at)->format('Y-m-d h:i A'),
                'customer' => $txn->booking ? $txn->booking->customer_name : 'Unknown',
                'email' => $txn->booking ? $txn->booking->customer_email : '-',
                'source' => $txn->booking ? ucfirst($txn->booking->source) : 'Unknown',
                'bookingId' => $txn->booking ? $txn->booking->booking_reference : '-',
                'amount' => (float)$txn->amount,
                'method' => ucfirst($txn->payment_method),
                'status' => ucfirst(str_replace('_', '-', $txn->status)),
            ];
        });

        $totalRevenue = $statsQuery->sum('amount');
        $totalTransactions = $statsQuery->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        return Inertia::render('transactions/index', [
            'initialTransactions' => $transactionsData,
            'stats' => [
                'totalRevenue' => (float)$totalRevenue,
                'totalTransactions' => $totalTransactions,
                'averageTransaction' => (float)$averageTransaction,
            ],
            'filters' => $request->only(['start_date', 'end_date', 'source', 'method'])
        ]);
    }

    public function export(Request $request)
    {
        $query = $this->buildQuery($request);

        $response = new \Symfony\Component\HttpFoundation\StreamedResponse(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Transaction ID', 'Date & Time', 'Customer', 'Email', 'Source', 'Booking ID', 'Amount', 'Payment Method', 'Status']);

            $query->chunk(500, function ($transactions) use ($handle) {
                foreach ($transactions as $txn) {
                    fputcsv($handle, [
                        $txn->transaction_reference,
                        Carbon::parse($txn->created_at)->format('Y-m-d H:i:s'),
                        $txn->booking ? $txn->booking->customer_name : 'Unknown',
                        $txn->booking ? $txn->booking->customer_email : '-',
                        $txn->booking ? ucfirst($txn->booking->source) : 'Unknown',
                        $txn->booking ? $txn->booking->booking_reference : '-',
                        $txn->amount,
                        ucfirst($txn->payment_method),
                        ucfirst(str_replace('_', '-', $txn->status)),
                    ]);
                }
            });
            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="transactions_export.csv"');

        return $response;
    }
}
