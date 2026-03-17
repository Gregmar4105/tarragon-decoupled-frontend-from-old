<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        // Add basic filtering if needed, for instance date range
        $query = Transaction::with('booking')->latest();

        $transactionsData = $query->get()->map(function ($txn) {
            return [
                'id' => $txn->transaction_reference,
                'date' => Carbon::parse($txn->created_at)->format('m/d h:i A'),
                'customer' => $txn->booking ? $txn->booking->customer_name : 'Unknown',
                'source' => $txn->booking && $txn->booking->user_id ? 'Online' : 'Walk-in',
                'bookingId' => $txn->booking ? $txn->booking->booking_reference : '-',
                'amount' => (float)$txn->amount,
                'method' => ucfirst($txn->payment_method),
                'status' => ucfirst(str_replace('_', '-', $txn->status)),
            ];
        });

        // Basic stats calculations
        $totalRevenue = $query->sum('amount');
        $totalTransactions = $query->count();
        $averageTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        return Inertia::render('transactions/index', [
            'initialTransactions' => $transactionsData,
            'stats' => [
                'totalRevenue' => (float)$totalRevenue,
                'totalTransactions' => $totalTransactions,
                'averageTransaction' => (float)$averageTransaction,
            ]
        ]);
    }
}
