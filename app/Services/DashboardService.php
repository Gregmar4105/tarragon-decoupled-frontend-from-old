<?php

namespace App\Services;

use App\Repositories\DashboardRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class DashboardService
{
    private DashboardRepository $repository;

    public function __construct(DashboardRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getRecentBookings(): Collection
    {
        return $this->repository->getRecentBookings(5);
    }

    public function getStats(): array
    {
        $capacity = 150; // Depending on requirements, this could be fetched from settings

        // Active Bags
        $activeBagsToday = $this->repository->getActiveBagsToday();
        $activeBagsYesterday = $this->repository->getActiveBagsYesterday();
        $activeBagsTrend = $this->calculateTrend($activeBagsToday, $activeBagsYesterday);

        // Revenue
        $revenueToday = $this->repository->getRevenueByDate(Carbon::today());
        $revenueYesterday = $this->repository->getRevenueByDate(Carbon::today()->subDay());
        $revenueTrend = $this->calculateTrend($revenueToday, $revenueYesterday);
        
        $totalBagsToday = $this->repository->getTotalBagsByDate(Carbon::today());
        $avgRevenuePerBag = $totalBagsToday > 0 ? ($revenueToday / $totalBagsToday) : 0;

        // Check-ins
        $checkinsToday = $this->repository->getCheckinsCountToday();
        $checkinsYesterday = $this->repository->getCheckinsCountYesterday();
        $checkinsTrend = $this->calculateTrend($checkinsToday, $checkinsYesterday);
        $pendingCheckins = $this->repository->getPendingCheckinsCount();

        // Duration
        $durations = $this->repository->getDurationsForCurrentMonth();
        $avgDuration = $durations->count() > 0 ? $durations->average() : 0;

        return [
            'activeBags' => [
                'value' => (int) $activeBagsToday,
                'capacity' => $capacity,
                'trend' => round($activeBagsTrend),
            ],
            'revenue' => [
                'value' => (float) $revenueToday,
                'avgPerBag' => (float) $avgRevenuePerBag,
                'trend' => round($revenueTrend),
            ],
            'checkins' => [
                'value' => $checkinsToday,
                'pending' => $pendingCheckins,
                'trend' => round($checkinsTrend),
            ],
            'duration' => [
                'value' => round($avgDuration, 1),
            ],
        ];
    }

    public function getPricing(): array
    {
        $activePlan = $this->repository->getActivePlan();

        return $activePlan ? [
            'small'  => (float) $activePlan->price_small,
            'medium' => (float) $activePlan->price_medium,
            'large'  => (float) $activePlan->price_large,
            'plus'   => (float) $activePlan->price_plus,
        ] : ['small' => 10, 'medium' => 15, 'large' => 20, 'plus' => 25];
    }

    public function getChartData(): array
    {
        $currentYear = Carbon::now()->year;
        $monthlyRevenue = $this->repository->getMonthlyRevenueForYear($currentYear);

        $chartData = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        foreach ($months as $index => $monthName) {
            $monthNum = $index + 1;
            $chartData[] = [
                'name' => $monthName,
                'total' => (float) ($monthlyRevenue[$monthNum] ?? 0),
            ];
        }

        return $chartData;
    }

    public function getSalesThisMonth(): int
    {
        return $this->repository->getSalesCountForCurrentMonth();
    }

    private function calculateTrend(float $today, float $yesterday): float
    {
        return $yesterday > 0 ? (($today - $yesterday) / $yesterday) * 100 : ($today > 0 ? 100 : 0);
    }
}
