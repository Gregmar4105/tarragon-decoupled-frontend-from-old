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
        if (!Schema::hasColumn('plans', 'subtitle')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->string('subtitle')->nullable();
            });
        }
        
        if (!Schema::hasColumn('plans', 'features')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->json('features')->nullable();
                $table->string('billing_cycle')->default('hourly');
                $table->boolean('is_popular')->default(false);
            });
        }
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
