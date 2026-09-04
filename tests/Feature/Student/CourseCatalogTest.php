<?php

namespace Tests\Feature\Student;

use App\Models\Course;
use App\Models\User;
use App\Models\CoursePurchase;
use App\Models\Wishlist;
use Tests\TestCase;

class CourseCatalogTest extends TestCase
{
    public function test_student_can_view_catalog(): void
    {
        $student = $this->createStudent();
        $teacher = $this->createTeacher();
        Course::factory()->count(3)->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($student)->getJson('/catalog');

        $response->assertOk();
        $this->assertCount(3, $response->json('courses'));
    }

    public function test_student_can_purchase_course(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create(['price' => 49.99]);

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/purchase");

        $response->assertCreated();
        $this->assertDatabaseHas('course_purchases', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_student_can_enroll_with_code(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        CoursePurchase::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => 'beta_paid',
            'reference' => 'BETA-TEST123456',
            'purchased_at' => now(),
        ]);

        $response = $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => $course->enrollment_code,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_student_cannot_enroll_without_purchase(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        $response = $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => $course->enrollment_code,
        ]);

        $response->assertForbidden();
    }

    public function test_student_cannot_enroll_with_wrong_code(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => 'WRONGCODE',
        ]);

        $response->assertStatus(422);
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

    public function test_student_can_rate_enrolled_course(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        CoursePurchase::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => 'beta_paid',
            'reference' => 'BETA-RATE123456',
            'purchased_at' => now(),
        ]);

        $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => $course->enrollment_code,
        ]);

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/ratings", [
            'rating' => 5,
            'review' => 'Great course!',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('course_ratings', [
            'student_id' => $student->id,
            'course_id' => $course->id,
            'rating' => 5,
        ]);
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
}
