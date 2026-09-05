<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->getJson('/profile');

        $response->assertOk();
        $response->assertJsonFragment(['id' => $user->id]);
    }

    public function test_user_can_update_name(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->postJson('/profile', [
            'name' => 'Updated Name',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_user_can_update_bio(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->postJson('/profile', [
            'bio' => 'New bio about me',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'bio' => 'New bio about me',
        ]);
    }

    public function test_user_can_update_password(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->postJson('/profile/password', [
            'current_password' => 'password',
            'password' => 'NewSecurePassword123!',
            'password_confirmation' => 'NewSecurePassword123!',
        ]);

        $response->assertOk();
    }

    public function test_wrong_current_password_is_rejected(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->postJson('/profile/password', [
            'current_password' => 'wrong-password',
            'password' => 'NewSecurePassword123!',
            'password_confirmation' => 'NewSecurePassword123!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    public function test_avatar_can_be_uploaded(): void
    {
        Storage::fake('public');
        $user = $this->createStudent();
        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $response = $this->actingAs($user)->postJson('/profile', [
            'avatar' => $file,
        ]);

        $response->assertOk();
    }

    public function test_user_can_delete_account(): void
    {
        $user = $this->createStudent();

        $response = $this->actingAs($user)->deleteJson('/profile');

        $response->assertOk();
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_unauthenticated_user_cannot_view_profile(): void
    {
        $response = $this->getJson('/profile');

        $response->assertRedirect();
    }
}
