<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\PlanService;
use Illuminate\Http\Request;

class PlanApiController extends Controller
{
    private PlanService $service;

    public function __construct(PlanService $service)
    {
        $this->service = $service;
    }

    /**
     * Get active plans for unauthenticated public visitors.
     */
    public function publicIndex()
    {
        $plans = Plan::where('is_active', true)->latest()->get();

        return response()->json([
            'data' => $plans->map(fn ($plan) => $this->formatPlan($plan))->toArray(),
        ]);
    }

    /**
     * Get all plans (for admin dashboard).
     */
    public function index()
    {
        $plans = Plan::latest()->get();

        return response()->json([
            'data' => $plans->map(fn ($plan) => $this->formatPlan($plan))->toArray(),
        ]);
    }

    /**
     * Create a new plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'duration_hours' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'price_small' => 'required|numeric|min:0',
            'price_regular' => 'required|numeric|min:0', // regular maps to medium in backend
            'price_large' => 'required|numeric|min:0',
            'price_plus' => 'required|numeric|min:0',
            'billing_cycle' => 'nullable|string|in:hourly,daily,weekly,monthly,custom',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'is_popular' => 'boolean',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Map price_regular to backend price_medium and set defaults
        $payload = array_merge($validated, [
            'price_medium' => $validated['price_regular'],
            'duration_hours' => $validated['duration_hours'] ?? 24,
            'billing_cycle' => $validated['billing_cycle'] ?? 'daily',
        ]);
        unset($payload['price_regular']);

        $plan = $this->service->createPlan($payload);

        return response()->json([
            'data' => $this->formatPlan($plan),
            'message' => 'Plan created successfully.',
        ], 201);
    }

    /**
     * Update an existing plan.
     */
    public function update(Request $request, Plan $pricing_plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'duration_hours' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'price_small' => 'required|numeric|min:0',
            'price_regular' => 'required|numeric|min:0', // regular maps to medium in backend
            'price_large' => 'required|numeric|min:0',
            'price_plus' => 'required|numeric|min:0',
            'billing_cycle' => 'nullable|string|in:hourly,daily,weekly,monthly,custom',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'is_popular' => 'boolean',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Map price_regular to backend price_medium and set defaults
        $payload = array_merge($validated, [
            'price_medium' => $validated['price_regular'],
            'duration_hours' => $validated['duration_hours'] ?? 24,
            'billing_cycle' => $validated['billing_cycle'] ?? 'daily',
        ]);
        unset($payload['price_regular']);

        $this->service->updatePlan($pricing_plan, $payload);
        $pricing_plan->refresh();

        return response()->json([
            'data' => $this->formatPlan($pricing_plan),
            'message' => 'Plan updated successfully.',
        ]);
    }

    /**
     * Deactivate / Delete a plan.
     */
    public function destroy(Plan $pricing_plan)
    {
        $this->service->deletePlan($pricing_plan);

        return response()->json([
            'message' => 'Plan deactivated successfully.',
        ]);
    }

    /**
     * Format Plan model to frontend expectations.
     */
    protected function formatPlan(Plan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'subtitle' => $plan->subtitle,
            'duration_hours' => $plan->duration_hours,
            'price' => (float) $plan->price,
            'price_small' => (float) $plan->price_small,
            'price_regular' => (float) $plan->price_medium, // Map price_medium to price_regular!
            'price_large' => (float) $plan->price_large,
            'price_plus' => (float) $plan->price_plus,
            'billing_cycle' => $plan->billing_cycle,
            'features' => $plan->features,
            'is_popular' => (bool) $plan->is_popular,
            'description' => $plan->description,
            'is_active' => (bool) $plan->is_active,
        ];
    }
}
