<?php

namespace Tests\Feature;

use App\Models\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    public function test_user_can_list_notifications(): void
    {
        $user = $this->createStudent();
        Notification::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson('/notifications');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = $this->createStudent();
        $notification = Notification::factory()->create([
            'user_id' => $user->id,
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->putJson("/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => true,
        ]);
    }

    public function test_user_cannot_mark_other_user_notification(): void
    {
        $user1 = $this->createStudent();
        $user2 = $this->createStudent();
        $notification = Notification::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->putJson("/notifications/{$notification->id}/read");

        $response->assertForbidden();
    }
}
