<?php

namespace Tests\Feature\Student;

use App\Models\Notification;
use Tests\TestCase;

class NotificationEndpointTest extends TestCase
{
    public function test_student_can_view_notifications(): void
    {
        $student = $this->createStudent();

        Notification::create([
            'user_id' => $student->id,
            'type' => 'chapter_created',
            'message' => 'New chapter added!',
            'data' => json_encode(['course_title' => 'Test', 'chapter_title' => 'Ch1']),
        ]);

        $response = $this->actingAs($student)->getJson('/notifications');
        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
    }

    public function test_student_can_mark_notification_as_read(): void
    {
        $student = $this->createStudent();

        $notification = Notification::create([
            'user_id' => $student->id,
            'type' => 'chapter_created',
            'message' => 'New chapter added!',
            'is_read' => false,
            'data' => json_encode(['course_title' => 'Test', 'chapter_title' => 'Ch1']),
        ]);

        $response = $this->actingAs($student)->putJson("/notifications/{$notification->id}/read");
        $response->assertOk();

        $notification->refresh();
        $this->assertTrue($notification->is_read);
    }

    public function test_student_cannot_mark_other_users_notification(): void
    {
        $student1 = $this->createStudent();
        $student2 = $this->createStudent();

        $notification = Notification::create([
            'user_id' => $student2->id,
            'type' => 'chapter_created',
            'message' => 'Other user notification!',
            'is_read' => false,
            'data' => json_encode(['course_title' => 'Test', 'chapter_title' => 'Ch1']),
        ]);

        $response = $this->actingAs($student1)->putJson("/notifications/{$notification->id}/read");
        $response->assertForbidden();
    }

    public function test_student_only_sees_own_notifications(): void
    {
        $student1 = $this->createStudent();
        $student2 = $this->createStudent();

        Notification::create([
            'user_id' => $student1->id,
            'type' => 'chapter_created',
            'message' => 'My notification',
            'data' => json_encode(['course_title' => 'Test', 'chapter_title' => 'Ch1']),
        ]);

        Notification::create([
            'user_id' => $student2->id,
            'type' => 'chapter_created',
            'message' => 'Other notification',
            'data' => json_encode(['course_title' => 'Test', 'chapter_title' => 'Ch1']),
        ]);

        $response = $this->actingAs($student1)->getJson('/notifications');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }
}
