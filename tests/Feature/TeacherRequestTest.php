<?php

namespace Tests\Feature;

use App\Models\TeacherRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_submit_teacher_request(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->postJson('/teacher-requests', [
            'name' => 'Student Teacher',
            'email' => 'student-teacher@example.com',
            'password' => 'StrongP@ssw0rd!2',
            'password_confirmation' => 'StrongP@ssw0rd!2',
            'proof_link' => 'https://linkedin.com/in/student-teacher',
        ]);

        $response->assertCreated();
    }

    public function test_unauthenticated_user_can_submit_teacher_request(): void
    {
        $response = $this->postJson('/teacher-requests', [
            'name' => 'New Teacher',
            'email' => 'new-teacher@example.com',
            'password' => 'StrongP@ssw0rd!2',
            'password_confirmation' => 'StrongP@ssw0rd!2',
            'proof_link' => 'https://linkedin.com/in/new-teacher',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('teacher_requests', [
            'email' => 'new-teacher@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        TeacherRequest::factory()->create([
            'email' => 'existing@example.com',
            'status' => 'pending',
        ]);

        $response = $this->postJson('/teacher-requests', [
            'name' => 'Duplicate',
            'email' => 'existing@example.com',
            'password' => 'StrongP@ssw0rd!2',
            'password_confirmation' => 'StrongP@ssw0rd!2',
            'proof_link' => 'https://linkedin.com/in/duplicate',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_approve_teacher_request(): void
    {
        $admin = $this->createAdmin();
        $request = TeacherRequest::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->postJson("/teacher-requests/{$request->id}/approve");

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'email' => $request->email,
            'role' => 'teacher',
        ]);
        $this->assertDatabaseHas('teacher_requests', [
            'id' => $request->id,
            'status' => 'approved',
            'password' => null,
        ]);
    }

    public function test_admin_can_reject_teacher_request(): void
    {
        $admin = $this->createAdmin();
        $request = TeacherRequest::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->postJson("/teacher-requests/{$request->id}/reject", [
            'notes' => 'Not qualified',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('teacher_requests', [
            'id' => $request->id,
            'status' => 'rejected',
        ]);
    }

    public function test_already_processed_request_cannot_be_approved(): void
    {
        $admin = $this->createAdmin();
        $request = TeacherRequest::factory()->create(['status' => 'approved']);

        $response = $this->actingAs($admin)->postJson("/teacher-requests/{$request->id}/approve");

        $response->assertStatus(422);
    }

    public function test_weak_password_is_rejected(): void
    {
        $response = $this->postJson('/teacher-requests', [
            'name' => 'Weak',
            'email' => 'weak@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'proof_link' => 'https://linkedin.com/in/weak',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }
}
