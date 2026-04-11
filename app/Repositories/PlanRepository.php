<?php

namespace App\Repositories;

use App\Models\Plan;
use Illuminate\Pagination\LengthAwarePaginator;

class PlanRepository
{
    /**
     * Get paginated plans.
     */
    public function getPaginatedPlans(int $perPage = 15): LengthAwarePaginator
    {
        return Plan::latest()->paginate($perPage);
    }
}
