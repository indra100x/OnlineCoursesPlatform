<?php

namespace Tests\Feature\Student;

use App\Models\Course;
use App\Models\Wishlist;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    public function test_student_can_view_wishlist(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        Wishlist::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $response = $this->actingAs($student)->getJson('/wishlist');
        $response->assertOk();
        $this->assertCount(1, $response->json('courses'));
    }

    public function test_student_can_add_to_wishlist(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        $response = $this->actingAs($student)->postJson('/wishlist', [
            'course_id' => $course->id,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('wishlists', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_student_can_remove_from_wishlist(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        Wishlist::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $response = $this->actingAs($student)->deleteJson("/wishlist/{$course->id}");
        $response->assertOk();
        $this->assertDatabaseMissing('wishlists', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_removing_nonexistent_wishlist_item_returns_404(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        $response = $this->actingAs($student)->deleteJson("/wishlist/{$course->id}");
        $response->assertNotFound();
    }

    public function test_unauthenticated_user_cannot_view_wishlist(): void
    {
        $response = $this->getJson('/wishlist');
        $response->assertUnauthorized();
    }

    public function test_teacher_cannot_add_to_wishlist(): void
    {
        $teacher = $this->createTeacher();
        $course = Course::factory()->create();

        $response = $this->actingAs($teacher)->postJson('/wishlist', [
            'course_id' => $course->id,
        ]);

        $response->assertForbidden();
    }
}
