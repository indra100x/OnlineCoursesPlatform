<?php

namespace Tests\Feature\Student;

use App\Models\Course;
use App\Models\CoursePurchase;
use App\Models\Enrollment;
use Tests\TestCase;

class EnrollmentTest extends TestCase
{
    public function test_student_can_purchase_and_enroll(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        $purchaseResponse = $this->actingAs($student)->postJson("/courses/{$course->id}/purchase");
        $purchaseResponse->assertCreated();
        $this->assertDatabaseHas('course_purchases', [
            'student_id' => $student->id,
            'course_id' => $course->id,
        ]);

        $enrollResponse = $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => $course->enrollment_code,
        ]);
        $enrollResponse->assertCreated();
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

    public function test_student_cannot_enroll_with_invalid_code(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => 'INVALID_CODE',
        ]);

        $response->assertStatus(422);
    }

    public function test_enrollment_is_idempotent(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        CoursePurchase::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'status' => CoursePurchase::STATUS_BETA_PAID,
            'reference' => 'BETA-TEST123',
            'purchased_at' => now(),
        ]);

        $response1 = $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => $course->enrollment_code,
        ]);
        $response1->assertCreated();

        $response2 = $this->actingAs($student)->postJson('/enroll', [
            'enrollment_code' => $course->enrollment_code,
        ]);
        $response2->assertOk();
        $response2->assertJson(['message' => 'You are already enrolled in this course.']);

        $this->assertCount(1, Enrollment::where('student_id', $student->id)->where('course_id', $course->id)->get());
    }

    public function test_student_can_view_enrolled_courses(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($student)->getJson('/my-courses');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_unauthenticated_user_cannot_enroll(): void
    {
        $course = Course::factory()->create();

        $response = $this->postJson('/enroll', [
            'enrollment_code' => $course->enrollment_code,
        ]);

        $response->assertUnauthorized();
    }
}
