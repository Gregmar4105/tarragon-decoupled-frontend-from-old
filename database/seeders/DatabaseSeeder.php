<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        \App\Models\User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            ['name' => 'admin', 'password' => bcrypt('admin123')]
        );

        // removed branches and locations
        
        \Illuminate\Support\Facades\DB::table('plans')->insertOrIgnore([
            'id' => 1, 'name' => 'Standard', 'duration_hours' => 24, 'price' => 100, 'is_active' => 1
        ]);
    }
}
