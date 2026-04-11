<?php

namespace App\Repositories;

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class DashboardRepository
{
    public function getRecentBookings(int $limit = 5): Collection
    {
        return Booking::with('transactions')->orderBy('created_at', 'desc')->take($limit)->get();
    }

    public function getActiveBagsToday(): int
    {
        return BookingItem::whereHas('booking', function ($query) {
            $query->whereIn('status', ['checked-in']);
        })->sum('quantity') ?? 0;
    }

    public function getActiveBagsYesterday(): int
    {
        return BookingItem::whereHas('booking', function ($query) {
            $query->whereIn('status', ['checked-in', 'checked-out'])
                  ->whereDate('drop_off_time', '<=', Carbon::yesterday())
                  ->where(function ($q) {
                      $q->whereNull('pick_up_time')
                        ->orWhereDate('pick_up_time', '>', Carbon::yesterday());
                  });
        })->sum('quantity') ?? 0;
    }

    public function getRevenueByDate(Carbon $date): float
    {
        return (float) Booking::whereDate('updated_at', $date)
            ->where('payment_status', 'paid')
            ->sum('total_price');
    }

    public function getTotalBagsByDate(Carbon $date): int
    {
        return BookingItem::whereHas('booking', function ($query) use ($date) {
            $query->whereDate('created_at', $date);
        })->sum('quantity') ?? 0;
    }

    public function getCheckinsCountToday(): int
    {
        return Booking::where('status', 'checked-in')->count();
    }

    public function getCheckinsCountYesterday(): int
    {
        return Booking::whereIn('status', ['checked-in', 'checked-out'])
            ->whereDate('drop_off_time', '<=', Carbon::yesterday())
            ->where(function ($q) {
                $q->whereNull('pick_up_time')
                  ->orWhereDate('pick_up_time', '>', Carbon::yesterday());
            })->count();
    }

    public function getPendingCheckinsCount(): int
    {
        return Booking::where('status', 'pending')->count();
    }

    public function getDurationsForCurrentMonth(): \Illuminate\Support\Collection
    {
        return Booking::whereNotNull('drop_off_time')
            ->whereNotNull('pick_up_time')
            ->whereMonth('created_at', Carbon::now()->month)
            ->where('status', '!=', 'cancelled')
            ->get()
            ->map(function ($booking) {
                return Carbon::parse($booking->drop_off_time)->diffInHours(Carbon::parse($booking->pick_up_time));
            });
    }

    public function getActivePlan(): ?Plan
    {
        return Plan::where('is_active', true)->first();
    }

    public function getMonthlyRevenueForYear(int $year): \Illuminate\Support\Collection
    {
        return Booking::whereYear('updated_at', $year)
            ->where('payment_status', 'paid')
            ->selectRaw('MONTH(updated_at) as month, SUM(total_price) as total')
            ->groupBy('month')
            ->pluck('total', 'month');
    }

    public function getSalesCountForCurrentMonth(): int
    {
        return Booking::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
    }
}
