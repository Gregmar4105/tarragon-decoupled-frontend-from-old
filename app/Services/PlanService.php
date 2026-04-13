<?php

namespace App\Services;

use App\Models\Plan;

class PlanService
{
    /**
     * Create a new pricing plan.
     */
    public function createPlan(array $data): Plan
    {
        return Plan::create($data);
    }

    /**
     * Update an existing pricing plan.
     */
    public function updatePlan(Plan $plan, array $data): bool
    {
        return $plan->update($data);
    }

    /**
     * Deactivate a pricing plan.
     */
    public function deletePlan(Plan $plan): bool
    {
        return $plan->update(['is_active' => false]);
    }
}
