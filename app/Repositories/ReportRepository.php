<?php

namespace App\Repositories;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class ReportRepository
{
    /**
     * Get bookings within a specific date range.
     */
    public function getBookingsWithinRange(Carbon $startDate, Carbon $endDate): Collection
    {
        return Booking::with('items')
            ->whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()])
            ->get();
    }

    /**
     * Get the count of bookings for a specific source within a date range.
     */
    public function getBookingCountBySource(Carbon $startDate, Carbon $endDate, string $source): int
    {
        return Booking::whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()])
            ->where('source', $source)
            ->count();
    }
}
