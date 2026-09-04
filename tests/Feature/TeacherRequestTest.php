<?php

namespace Tests\Feature;

use App\Models\TeacherRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TeacherRequestTest extends TestCase
{
    public function test_anyone_can_submit_teacher_request(): void
    {
        $response = $this->postJson('/teacher-requests', [
            'name' => 'New Teacher',
            'email' => 'newteacher@example.com',
            'password' => 'SecretPass123!',
            'bio' => 'I teach programming.',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('teacher_requests', [
            'email' => 'newteacher@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_approve_teacher_request(): void
    {
        $admin = $this->createAdmin();

        $request = TeacherRequest::create([
            'name' => 'Approved Teacher',
            'email' => 'approved@example.com',
            'password' => 'SecretPass123!',
            'bio' => 'Experienced teacher.',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->postJson("/teacher-requests/{$request->id}/approve", [
            'admin_notes' => 'Verified credentials.',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'email' => 'approved@example.com',
            'role' => 'teacher',
        ]);

        $user = User::where('email', 'approved@example.com')->first();
        $this->assertTrue(Hash::check('SecretPass123!', $user->password));
    }

    public function test_admin_can_reject_teacher_request(): void
    {
        $admin = $this->createAdmin();

        $request = TeacherRequest::create([
            'name' => 'Rejected Teacher',
            'email' => 'rejected@example.com',
            'password' => 'SecretPass123!',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->postJson("/teacher-requests/{$request->id}/reject", [
            'admin_notes' => 'Insufficient proof.',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('teacher_requests', [
            'id' => $request->id,
            'status' => 'rejected',
        ]);
        $this->assertDatabaseMissing('users', ['email' => 'rejected@example.com']);
    }

    public function test_cannot_approve_already_processed_request(): void
    {
        $admin = $this->createAdmin();

        $request = TeacherRequest::create([
            'name' => 'Already Approved',
            'email' => 'already@example.com',
            'password' => 'SecretPass123!',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($admin)->postJson("/teacher-requests/{$request->id}/approve");

        $response->assertStatus(422);
    }

    public function test_admin_can_list_teacher_requests(): void
    {
        $admin = $this->createAdmin();

        TeacherRequest::create([
            'name' => 'Teacher One',
            'email' => 'one@example.com',
            'password' => 'SecretPass123!',
            'status' => 'pending',
        ]);

        TeacherRequest::create([
            'name' => 'Teacher Two',
            'email' => 'two@example.com',
            'password' => 'SecretPass123!',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($admin)->getJson('/teacher-requests');
        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_non_admin_cannot_list_teacher_requests(): void
    {
        $teacher = $this->createTeacher();

        $response = $this->actingAs($teacher)->getJson('/teacher-requests');
        $response->assertForbidden();
    }
}
