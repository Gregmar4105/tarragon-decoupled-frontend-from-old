<?php

namespace App\Repositories;

use App\Models\Transaction;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class TransactionRepository
{
    /**
     * Build the filtered transaction query.
     */
    public function getFilteredQuery(array $filters)
    {
        $query = Transaction::with('booking')->latest();

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $startDate = Carbon::parse($filters['start_date'])->startOfDay();
            $endDate = Carbon::parse($filters['end_date'])->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        if (!empty($filters['source']) && $filters['source'] !== 'all') {
            $source = $filters['source'];
            $query->whereHas('booking', function ($q) use ($source) {
                $q->where('source', $source);
            });
        }

        if (!empty($filters['method']) && $filters['method'] !== 'all') {
            $query->where('payment_method', $filters['method']);
        }

        return $query;
    }

    /**
     * Get paginated transactions.
     */
    public function getPaginatedList(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->getFilteredQuery($filters)->paginate($perPage);
    }
}
