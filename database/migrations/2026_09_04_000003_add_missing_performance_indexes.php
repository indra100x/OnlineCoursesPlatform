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
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read', 'created_at']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->index(['teacher_id', 'created_at']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->index(['student_id', 'created_at']);
        });

        Schema::table('course_purchases', function (Blueprint $table) {
            $table->index(['student_id', 'created_at']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->index(['course_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_read', 'created_at']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex(['teacher_id', 'created_at']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'created_at']);
        });

        Schema::table('course_purchases', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'created_at']);
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->dropIndex(['course_id', 'position']);
        });
    }
};
