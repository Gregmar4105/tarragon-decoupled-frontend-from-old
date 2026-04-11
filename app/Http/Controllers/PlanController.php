<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Repositories\PlanRepository;
use App\Services\PlanService;
use App\Http\Resources\PlanResource;

class PlanController extends Controller
{
    private PlanRepository $repository;
    private PlanService $service;

    public function __construct(PlanRepository $repository, PlanService $service)
    {
        $this->repository = $repository;
        $this->service = $service;
    }

    public function index()
    {
        $paginatedPlans = $this->repository->getPaginatedPlans();

        return Inertia::render('plans/index', [
            'plans' => PlanResource::collection($paginatedPlans->items())->resolve()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'duration_hours' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'price_small' => 'required|numeric|min:0',
            'price_medium' => 'required|numeric|min:0',
            'price_large' => 'required|numeric|min:0',
            'price_plus' => 'required|numeric|min:0',
            'billing_cycle' => 'required|string|in:hourly,daily,weekly,monthly,custom',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'is_popular' => 'boolean',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $this->service->createPlan($validated);

        return back()->with('success', 'Plan created successfully.');
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'duration_hours' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'price_small' => 'required|numeric|min:0',
            'price_medium' => 'required|numeric|min:0',
            'price_large' => 'required|numeric|min:0',
            'price_plus' => 'required|numeric|min:0',
            'billing_cycle' => 'required|string|in:hourly,daily,weekly,monthly,custom',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'is_popular' => 'boolean',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $this->service->updatePlan($plan, $validated);

        return back()->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan)
    {
        $this->service->deletePlan($plan);

        return back()->with('success', 'Plan deleted successfully.');
    }
}
