<?php

namespace Tests\Feature\Student;

use App\Models\Course;
use App\Models\CourseRating;
use App\Models\Enrollment;
use Tests\TestCase;

class CourseRatingTest extends TestCase
{
    public function test_enrolled_student_can_rate_course(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/ratings", [
            'rating' => 5,
            'review' => 'Excellent course!',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('course_ratings', [
            'student_id' => $student->id,
            'course_id' => $course->id,
            'rating' => 5,
        ]);
    }

    public function test_unenrolled_student_cannot_rate_course(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/ratings", [
            'rating' => 5,
            'review' => 'Great!',
        ]);

        $response->assertForbidden();
    }

    public function test_rating_requires_valid_rating_value(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/ratings", [
            'rating' => 6,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['rating']);
    }

    public function test_student_can_update_existing_rating(): void
    {
        $student = $this->createStudent();
        $course = Course::factory()->create();

        Enrollment::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'enrolled_at' => now(),
        ]);

        CourseRating::create([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'rating' => 3,
            'review' => 'Good.',
        ]);

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/ratings", [
            'rating' => 5,
            'review' => 'Actually, it was excellent!',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('course_ratings', [
            'student_id' => $student->id,
            'course_id' => $course->id,
            'rating' => 5,
        ]);
        $this->assertCount(1, CourseRating::where('student_id', $student->id)->where('course_id', $course->id)->get());
    }

    public function test_unauthenticated_user_cannot_rate(): void
    {
        $course = Course::factory()->create();

        $response = $this->postJson("/courses/{$course->id}/ratings", [
            'rating' => 5,
        ]);

        $response->assertUnauthorized();
    }
}
