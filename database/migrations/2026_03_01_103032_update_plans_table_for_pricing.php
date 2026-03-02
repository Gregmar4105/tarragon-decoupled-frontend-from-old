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
        Schema::table('plans', function (Blueprint $table) {
            $table->string('subtitle')->nullable()->after('name');
            $table->json('features')->nullable()->after('price');
            $table->string('billing_cycle')->default('hourly')->after('features');
            $table->boolean('is_popular')->default(false)->after('billing_cycle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['subtitle', 'features', 'billing_cycle', 'is_popular']);
        });
    }
};
