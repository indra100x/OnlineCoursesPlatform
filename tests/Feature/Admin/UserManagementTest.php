<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    public function test_admin_can_list_users(): void
    {
        $admin = $this->createAdmin();
        User::factory()->count(5)->create();

        $response = $this->actingAs($admin)->getJson('/users');

        $response->assertOk();
        $this->assertCount(6, $response->json('data'));
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $teacher = $this->createTeacher();

        $response = $this->actingAs($teacher)->getJson('/users');

        $response->assertForbidden();
    }

    public function test_admin_can_create_user(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->postJson('/users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'role' => 'student',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_admin_can_update_user(): void
    {
        $admin = $this->createAdmin();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->putJson("/users/{$user->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = $this->createAdmin();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/users/{$user->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_own_account(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->deleteJson("/users/{$admin->id}");

        $response->assertStatus(422);
    }
}
