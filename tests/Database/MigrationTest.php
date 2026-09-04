<?php

namespace Tests\Database;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationTest extends TestCase
{
    public function test_users_table_has_required_columns(): void
    {
        $this->assertTrue(Schema::hasColumn('users', 'id'));
        $this->assertTrue(Schema::hasColumn('users', 'name'));
        $this->assertTrue(Schema::hasColumn('users', 'email'));
        $this->assertTrue(Schema::hasColumn('users', 'password'));
        $this->assertTrue(Schema::hasColumn('users', 'role'));
        $this->assertTrue(Schema::hasColumn('users', 'avatar_path'));
        $this->assertTrue(Schema::hasColumn('users', 'bio'));
    }

    public function test_courses_table_has_required_columns(): void
    {
        $this->assertTrue(Schema::hasColumn('courses', 'id'));
        $this->assertTrue(Schema::hasColumn('courses', 'title'));
        $this->assertTrue(Schema::hasColumn('courses', 'description'));
        $this->assertTrue(Schema::hasColumn('courses', 'price'));
        $this->assertTrue(Schema::hasColumn('courses', 'teacher_id'));
        $this->assertTrue(Schema::hasColumn('courses', 'enrollment_code'));
    }

    public function test_enrollments_table_has_required_columns(): void
    {
        $this->assertTrue(Schema::hasColumn('enrollments', 'id'));
        $this->assertTrue(Schema::hasColumn('enrollments', 'student_id'));
        $this->assertTrue(Schema::hasColumn('enrollments', 'course_id'));
    }

    public function test_chapters_table_has_required_columns(): void
    {
        $this->assertTrue(Schema::hasColumn('chapters', 'id'));
        $this->assertTrue(Schema::hasColumn('chapters', 'title'));
        $this->assertTrue(Schema::hasColumn('chapters', 'course_id'));
        $this->assertTrue(Schema::hasColumn('chapters', 'position'));
    }

    public function test_notifications_table_has_required_columns(): void
    {
        $this->assertTrue(Schema::hasColumn('notifications', 'id'));
        $this->assertTrue(Schema::hasColumn('notifications', 'user_id'));
        $this->assertTrue(Schema::hasColumn('notifications', 'type'));
        $this->assertTrue(Schema::hasColumn('notifications', 'message'));
        $this->assertTrue(Schema::hasColumn('notifications', 'is_read'));
    }
}
