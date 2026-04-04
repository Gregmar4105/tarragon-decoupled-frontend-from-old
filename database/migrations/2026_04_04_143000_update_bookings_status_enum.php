<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add new enum values
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'dropped_off', 'completed', 'cancelled', 'checked-in', 'checked-out') DEFAULT 'pending'");
        
        // 2. Update existing records
        DB::table('bookings')->where('status', 'dropped_off')->update(['status' => 'checked-in']);
        DB::table('bookings')->where('status', 'completed')->update(['status' => 'checked-out']);

        // 3. Remove old enum values
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'dropped_off', 'completed', 'cancelled', 'checked-in', 'checked-out') DEFAULT 'pending'");

        DB::table('bookings')->where('status', 'checked-in')->update(['status' => 'dropped_off']);
        DB::table('bookings')->where('status', 'checked-out')->update(['status' => 'completed']);

        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'dropped_off', 'completed', 'cancelled') DEFAULT 'pending'");
    }
};
