<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Hourly Rate',
                'subtitle' => 'Perfect for short layovers',
                'duration_hours' => 1,
                'price' => 2.00,
                'billing_cycle' => 'hourly',
                'features' => [
                    'Insurance included',
                    '24/7 CCTV Monitoring',
                    'Secure Tamper-proof Seals'
                ],
                'is_popular' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Daily Rate',
                'subtitle' => 'Best value for day trips',
                'duration_hours' => 24,
                'price' => 5.00,
                'billing_cycle' => 'daily',
                'features' => [
                    'Insurance included',
                    '24/7 access & security',
                    'Free Cancellation',
                    'Any bag size'
                ],
                'is_popular' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Long Term',
                'subtitle' => 'For extended stays',
                'duration_hours' => 24,
                'price' => 3.50,
                'billing_cycle' => 'daily',
                'features' => [
                    'Premium Insurance',
                    'Dedicated storage area',
                    'Priority support'
                ],
                'is_popular' => false,
                'is_active' => true,
                'description' => '*When booking 7+ days',
            ],
        ];

        foreach ($plans as $plan) {
            \App\Models\Plan::updateOrCreate(
                ['name' => $plan['name']], // Only unique identifier we can guarantee
                $plan
            );
        }
    }
}
