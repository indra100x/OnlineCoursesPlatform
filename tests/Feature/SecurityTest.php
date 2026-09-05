<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CoursePurchase;
use App\Models\Enrollment;
use App\Models\Notification;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect();
    }

    public function test_student_cannot_access_admin_routes(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->getJson('/users');

        $response->assertForbidden();
    }

    public function test_student_cannot_access_teacher_routes(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->getJson('/courses');

        $response->assertForbidden();
    }

    public function test_teacher_cannot_access_admin_routes(): void
    {
        $teacher = $this->createTeacher();

        $response = $this->actingAs($teacher)->getJson('/users');

        $response->assertForbidden();
    }

    public function test_teacher_cannot_update_other_teacher_course(): void
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher1->id]);

        $response = $this->actingAs($teacher2)->putJson("/courses/{$course->id}", [
            'title' => 'Hacked Course',
        ]);

        $response->assertForbidden();
    }

    public function test_teacher_cannot_delete_other_teacher_course(): void
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher1->id]);

        $response = $this->actingAs($teacher2)->deleteJson("/courses/{$course->id}");

        $response->assertForbidden();
    }

    public function test_student_cannot_access_other_student_enrollments(): void
    {
        $student1 = $this->createStudent();
        $student2 = $this->createStudent();
        $course = Course::factory()->create();

        Enrollment::create([
            'student_id' => $student1->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($student2)->getJson('/my-courses');

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
    }

    public function test_student_cannot_rate_unenrolled_course(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/ratings", [
            'rating' => 5,
            'review' => 'Great course!',
        ]);

        $response->assertForbidden();
    }

    public function test_student_cannot_purchase_already_purchased_course_twice(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        CoursePurchase::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => CoursePurchase::STATUS_BETA_PAID,
            'reference' => 'BETA-EXISTING',
            'purchased_at' => now(),
        ]);

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/purchase");

        $response->assertOk();
    }

    public function test_teacher_cannot_create_course_without_required_fields(): void
    {
        $teacher = $this->createTeacher();

        $response = $this->actingAs($teacher)->postJson('/courses', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title', 'description']);
    }

    public function test_admin_cannot_create_admin_role_user(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->postJson('/users', [
            'name' => 'Hacker',
            'email' => 'hacker@example.com',
            'password' => 'SuperSecret123!@#',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    public function test_student_can_access_teacher_public_profile(): void
    {
        $student = $this->createStudent();
        $teacher = $this->createTeacher();

        $response = $this->actingAs($student)->getJson("/teachers/{$teacher->id}/profile");

        $response->assertOk();
    }

    public function test_student_cannot_mark_other_students_notifications(): void
    {
        $student1 = $this->createStudent();
        $student2 = $this->createStudent();
        $course = Course::factory()->create(['teacher_id' => $this->createTeacher()->id]);

        $notification = Notification::create([
            'user_id' => $student1->id,
            'course_id' => $course->id,
            'type' => 'chapter_created',
            'message' => 'New chapter available',
            'is_read' => false,
        ]);

        $response = $this->actingAs($student2)->putJson("/notifications/{$notification->id}/read");

        $response->assertForbidden();
    }

    public function test_weak_password_is_rejected_in_production(): void
    {
        $admin = $this->createAdmin();

        app()->detectEnvironment(fn () => 'production');
        $this->withoutMiddleware(ValidateCsrfToken::class);

        $response = $this->actingAs($admin)->postJson('/users', [
            'name' => 'Weak User',
            'email' => 'weak@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }
}
