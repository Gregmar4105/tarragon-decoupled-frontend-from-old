<?php

namespace App\Repositories;

use App\Models\Booking;
use Illuminate\Pagination\LengthAwarePaginator;

class BookingRepository
{
    /**
     * Get paginated and filtered bookings.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getPaginatedList(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Booking::with('items')->orderBy('created_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('booking_reference', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', strtolower($filters['status']));
        }

        if (!empty($filters['payment']) && $filters['payment'] !== 'all') {
            $query->where('payment_status', strtolower($filters['payment']));
        }

        if (!empty($filters['source']) && $filters['source'] !== 'all') {
            $query->where('source', strtolower($filters['source']));
        }

        return $query->paginate($perPage);
    }
}
