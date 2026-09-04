<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProfileTest extends TestCase
{
    public function test_user_can_view_profile(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->getJson('/profile');

        $response->assertOk();
        $this->assertEquals($user->id, $response->json('profile.id'));
    }

    public function test_user_can_update_profile(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->postJson('/profile', [
            'name' => 'Updated Name',
            'bio' => 'Updated bio',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_user_can_update_password(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->postJson('/profile/password', [
            'current_password' => 'password',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertOk();
    }

    public function test_user_cannot_update_password_with_wrong_current(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->postJson('/profile/password', [
            'current_password' => 'wrongpassword',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(422);
    }
}
