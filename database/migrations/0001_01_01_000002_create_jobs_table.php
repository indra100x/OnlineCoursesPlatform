<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        DB::statement('
            CREATE TABLE jobs (
                id BIGSERIAL PRIMARY KEY,
                queue VARCHAR(255) NOT NULL,
                payload TEXT NOT NULL,
                attempts SMALLINT NOT NULL,
                reserved_at INTEGER,
                available_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            )
        ');

        DB::statement('CREATE INDEX jobs_queue_index ON jobs(queue)');

        DB::statement('
            CREATE TABLE job_batches (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                total_jobs INTEGER NOT NULL,
                pending_jobs INTEGER NOT NULL,
                failed_jobs INTEGER NOT NULL,
                failed_job_ids TEXT NOT NULL,
                options TEXT,
                cancelled_at INTEGER,
                created_at INTEGER NOT NULL,
                finished_at INTEGER
            )
        ');

        DB::statement('
            CREATE TABLE failed_jobs (
                id BIGSERIAL PRIMARY KEY,
                uuid VARCHAR(255) NOT NULL,
                connection TEXT NOT NULL,
                queue TEXT NOT NULL,
                payload TEXT NOT NULL,
                exception TEXT NOT NULL,
                failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ');

        DB::statement('CREATE UNIQUE INDEX failed_jobs_uuid_unique ON failed_jobs(uuid)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS failed_jobs_uuid_unique');
        DB::statement('DROP TABLE IF EXISTS failed_jobs');
        DB::statement('DROP TABLE IF EXISTS job_batches');
        DB::statement('DROP INDEX IF EXISTS jobs_queue_index');
        DB::statement('DROP TABLE IF EXISTS jobs');
    }
};
