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
            $table->decimal('price_small', 8, 2)->default(0)->after('price');
            $table->decimal('price_medium', 8, 2)->default(0)->after('price_small');
            $table->decimal('price_large', 8, 2)->default(0)->after('price_medium');
            $table->decimal('price_plus', 8, 2)->default(0)->after('price_large');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['price_small', 'price_medium', 'price_large', 'price_plus']);
        });
    }
};
