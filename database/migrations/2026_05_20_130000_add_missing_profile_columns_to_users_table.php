<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        if (! Schema::hasColumn('users', 'remember_token')) {
            DB::statement('ALTER TABLE users ADD COLUMN remember_token VARCHAR(100) NULL');
        }

        if (! Schema::hasColumn('users', 'avatar_path')) {
            DB::statement('ALTER TABLE users ADD COLUMN avatar_path VARCHAR(2048) NULL');
        }

        if (! Schema::hasColumn('users', 'bio')) {
            DB::statement('ALTER TABLE users ADD COLUMN bio TEXT NULL');
        }

        DB::statement("UPDATE users SET role = 'student' WHERE role IS NULL");
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'bio')) {
            DB::statement('ALTER TABLE users DROP COLUMN bio');
        }

        if (Schema::hasColumn('users', 'avatar_path')) {
            DB::statement('ALTER TABLE users DROP COLUMN avatar_path');
        }

        if (Schema::hasColumn('users', 'remember_token')) {
            DB::statement('ALTER TABLE users DROP COLUMN remember_token');
        }
    }
};
