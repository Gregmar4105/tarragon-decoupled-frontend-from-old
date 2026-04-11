<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\DashboardService;
use App\Http\Resources\DashboardRecentBookingResource;
use App\Http\Resources\DashboardRecentSaleResource;

class DashboardController extends Controller
{
    private DashboardService $service;

    public function __construct(DashboardService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $recentBookings = $this->service->getRecentBookings();

        return Inertia::render('dashboard', [
            'recentBookings' => DashboardRecentBookingResource::collection($recentBookings)->resolve(),
            'recentSales'    => DashboardRecentSaleResource::collection($recentBookings)->resolve(),
            'stats'          => $this->service->getStats(),
            'pricing'        => $this->service->getPricing(),
            'chartData'      => $this->service->getChartData(),
            'salesThisMonth' => $this->service->getSalesThisMonth(),
        ]);
    }
}
