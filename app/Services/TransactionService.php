<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class TransactionService
{
    /**
     * Calculate stats for the current filtered query.
     */
    public function calculateStats(Builder $query): array
    {
        $statsQuery = (clone $query)->whereHas('booking', function ($q) {
            $q->where('payment_status', 'paid');
        });

        $totalRevenue = $statsQuery->sum('amount');
        $totalTransactions = $statsQuery->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        return [
            'totalRevenue' => (float)$totalRevenue,
            'totalTransactions' => $totalTransactions,
            'averageTransaction' => (float)$averageTransaction,
        ];
    }

    /**
     * Export the filtered transactions query to a CSV StreamedResponse.
     */
    public function exportCsv(Builder $query): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($query) {
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
