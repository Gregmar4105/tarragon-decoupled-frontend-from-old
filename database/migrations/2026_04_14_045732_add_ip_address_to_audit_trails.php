<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * SQLite (used by NativePHP Android) does not support ADD COLUMN with ->after().
     * We use Schema::getColumnListing() to check if the column already exists,
     * and skip the ->after() call when running on SQLite.
     */
    public function up(): void
    {
        // Skip if the column already exists (idempotent)
        if (Schema::hasColumn('audit_trails', 'ip_address')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // SQLite: ADD COLUMN works but ->after() is not supported (and not needed)
            Schema::table('audit_trails', function (Blueprint $table) {
                $table->string('ip_address', 45)->nullable();
            });
        } else {
            // MySQL / PostgreSQL: use ->after() for correct column ordering
            Schema::table('audit_trails', function (Blueprint $table) {
                $table->string('ip_address', 45)->nullable()->after('activity');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_trails', function (Blueprint $table) {
            $table->dropColumn('ip_address');
        });
    }
};
