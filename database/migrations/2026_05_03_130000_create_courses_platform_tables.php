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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->decimal('price', 10, 2)->default(0);
            $table->foreignId('teacher_id')->index()->constrained('users')->cascadeOnDelete();
            $table->string('enrollment_code', 24)->unique();
            $table->timestamps();
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->index()->constrained()->cascadeOnDelete();
            $table->timestamp('enrolled_at');
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });

        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->index()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->unsignedInteger('position');
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamps();

            $table->unique(['course_id', 'position']);
        });

        Schema::create('course_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->index()->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['beta_paid'])->default('beta_paid')->index();
            $table->string('reference')->unique();
            $table->timestamp('purchased_at');
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->index()->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });

        Schema::create('course_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->index()->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('review')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'course_id']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->index()->constrained()->nullOnDelete();
            $table->foreignId('chapter_id')->nullable()->index()->constrained()->nullOnDelete();
            $table->enum('type', ['chapter_created'])->default('chapter_created')->index();
            $table->json('data')->nullable();
            $table->text('message');
            $table->boolean('is_read')->default(false)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('course_ratings');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('course_purchases');
        Schema::dropIfExists('chapters');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('courses');
    }
};
