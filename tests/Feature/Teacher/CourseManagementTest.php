<?php

namespace Tests\Feature\Teacher;

use App\Models\Course;
use Tests\TestCase;

class CourseManagementTest extends TestCase
{
    public function test_teacher_can_list_courses(): void
    {
        $teacher = $this->createTeacher();
        Course::factory()->count(3)->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($teacher)->getJson('/courses');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_teacher_can_create_course(): void
    {
        $teacher = $this->createTeacher();

        $response = $this->actingAs($teacher)->postJson('/courses', [
            'title' => 'New Course',
            'description' => 'Course description',
            'price' => 99.99,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('courses', ['title' => 'New Course']);
    }

    public function test_teacher_can_update_own_course(): void
    {
        $teacher = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($teacher)->putJson("/courses/{$course->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => 'Updated Title']);
    }

    public function test_teacher_cannot_update_other_teacher_course(): void
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher2->id]);

        $response = $this->actingAs($teacher1)->putJson("/courses/{$course->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertForbidden();
    }

    public function test_teacher_can_delete_own_course(): void
    {
        $teacher = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($teacher)->deleteJson("/courses/{$course->id}");

        $response->assertOk();
        $this->assertSoftDeleted('courses', ['id' => $course->id]);
    }

    public function test_student_cannot_create_course(): void
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->postJson('/courses', [
            'title' => 'New Course',
            'description' => 'Course description',
            'price' => 99.99,
        ]);

        $response->assertForbidden();
    }
}
