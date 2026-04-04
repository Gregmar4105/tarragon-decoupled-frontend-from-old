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
        // Add a trigger to prevent deleting any rows from the audit_trails table
        DB::unprepared('
            CREATE TRIGGER prevent_audit_trails_deletion
            BEFORE DELETE ON audit_trails
            FOR EACH ROW
            BEGIN
                SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "Deletions from the audit_trails table are strictly prohibited.";
            END
        ');

        // Add a trigger to prevent updating any rows in the audit_trails table
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
        DB::unprepared('DROP TRIGGER IF EXISTS prevent_audit_trails_deletion');
        DB::unprepared('DROP TRIGGER IF EXISTS prevent_audit_trails_update');
    }
};
