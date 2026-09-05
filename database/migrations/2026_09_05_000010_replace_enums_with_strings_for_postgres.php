<?php

namespace Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace MySQL ENUM with string for PostgreSQL compatibility.
     */
    public function up(): void
    {
        Schema::table('course_purchases', function (Blueprint $table) {
            $table->string('status', 50)->default('beta_paid')->change();
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('type', 50)->default('chapter_created')->change();
        });
    }

    public function down(): void
    {
        Schema::table('course_purchases', function (Blueprint $table) {
            $table->enum('status', ['beta_paid'])->default('beta_paid')->change();
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('type', ['chapter_created'])->default('chapter_created')->change();
        });
    }
};
