<?php

namespace Tests\Unit\Models;

use App\Models\Course;
use App\Models\User;
use Tests\TestCase;

class CourseTest extends TestCase
{
    public function test_course_can_be_created(): void
    {
        $course = Course::factory()->create();

        $this->assertDatabaseHas('courses', [
            'title' => $course->title,
        ]);
    }

    public function test_course_has_enrollment_code(): void
    {
        $course = Course::factory()->create();

        $this->assertNotEmpty($course->enrollment_code);
    }

    public function test_course_can_be_free(): void
    {
        $course = Course::factory()->free()->create();

        $this->assertEquals(0, $course->price);
    }

    public function test_course_belongs_to_teacher(): void
    {
        $teacher = User::factory()->teacher()->create();
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);

        $this->assertEquals($teacher->id, $course->teacher->id);
    }

    public function test_course_can_have_chapters(): void
    {
        $course = Course::factory()->create();

        $this->assertEmpty($course->chapters);
    }

    public function test_course_can_have_enrollments(): void
    {
        $course = Course::factory()->create();

        $this->assertEmpty($course->enrollments);
    }
}
