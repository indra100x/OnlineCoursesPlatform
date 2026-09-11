<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK ((type)::text = 'chapter_created'::text)");
    }
};
