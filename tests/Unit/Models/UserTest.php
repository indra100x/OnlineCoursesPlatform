<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Tests\TestCase;

class UserTest extends TestCase
{
    public function test_user_can_be_created(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseHas('users', [
            'email' => $user->email,
        ]);
    }

    public function test_user_has_correct_role(): void
    {
        $admin = User::factory()->admin()->create();
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student()->create();

        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($teacher->isTeacher());
        $this->assertTrue($student->isStudent());
    }

    public function test_user_roles_list(): void
    {
        $roles = User::roles();

        $this->assertContains('admin', $roles);
        $this->assertContains('teacher', $roles);
        $this->assertContains('student', $roles);
    }

    public function test_user_can_have_taught_courses(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->assertEmpty($teacher->taughtCourses);
    }

    public function test_user_can_have_enrollments(): void
    {
        $student = User::factory()->student()->create();

        $this->assertEmpty($student->enrollments);
    }
}
