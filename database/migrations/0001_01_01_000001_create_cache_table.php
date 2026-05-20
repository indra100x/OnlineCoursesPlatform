<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        DB::statement('
            CREATE TABLE cache (
                key VARCHAR(255) PRIMARY KEY,
                value TEXT NOT NULL,
                expiration BIGINT NOT NULL
            )
        ');

        DB::statement('CREATE INDEX cache_expiration_index ON cache(expiration)');

        DB::statement('
            CREATE TABLE cache_locks (
                key VARCHAR(255) PRIMARY KEY,
                owner VARCHAR(255) NOT NULL,
                expiration BIGINT NOT NULL
            )
        ');

        DB::statement('CREATE INDEX cache_locks_expiration_index ON cache_locks(expiration)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS cache_locks_expiration_index');
        DB::statement('DROP TABLE IF EXISTS cache_locks');
        DB::statement('DROP INDEX IF EXISTS cache_expiration_index');
        DB::statement('DROP TABLE IF EXISTS cache');
    }
};
