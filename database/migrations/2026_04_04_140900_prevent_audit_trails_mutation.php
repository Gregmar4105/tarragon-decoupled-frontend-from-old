<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * MySQL triggers use SIGNAL SQLSTATE which is not supported by SQLite
     * (used by NativePHP Android). We skip trigger creation on SQLite entirely —
     * the audit_trails table is still append-only by application convention.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        // SQLite does not support SIGNAL SQLSTATE — skip triggers entirely
        if ($driver === 'sqlite') {
            return;
        }

        // MySQL: add triggers to prevent deletion and mutation of audit records
        DB::unprepared('
            CREATE TRIGGER prevent_audit_trails_deletion
            BEFORE DELETE ON audit_trails
            FOR EACH ROW
            BEGIN
                SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "Deletions from the audit_trails table are strictly prohibited.";
            END
        ');

        DB::unprepared('
            CREATE TRIGGER prevent_audit_trails_update
            BEFORE UPDATE ON audit_trails
            FOR EACH ROW
            BEGIN
                SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "Updates to the audit_trails table are strictly prohibited.";
            END
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS prevent_audit_trails_deletion');
        DB::unprepared('DROP TRIGGER IF EXISTS prevent_audit_trails_update');
    }
};
