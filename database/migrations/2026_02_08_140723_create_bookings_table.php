<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('location_id')->nullable()->constrained('locations');
            $table->foreignId('plan_id')->constrained('plans');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->dateTime('drop_off_time');
            $table->dateTime('pick_up_time');
            $table->decimal('total_price', 8, 2);
            $table->enum('status', ['pending', 'confirmed', 'dropped_off', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->string('booking_reference')->unique();
            $table->string('qr_code_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
