<?php

namespace Tests\Unit\Services;

use App\Models\Course;
use App\Models\User;
use App\Services\CacheService;
use App\Services\CourseService;
use Tests\TestCase;

class CourseServiceTest extends TestCase
{
    protected CourseService $courseService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->courseService = new CourseService(new CacheService);
    }

    public function test_create_course(): void
    {
        $teacher = User::factory()->teacher()->create();
        $data = [
            'title' => 'Test Course',
            'description' => 'Test Description',
            'price' => 49.99,
        ];

        $course = $this->courseService->createCourse($teacher, $data);

        $this->assertInstanceOf(Course::class, $course);
        $this->assertEquals('Test Course', $course->title);
        $this->assertEquals($teacher->id, $course->teacher_id);
    }

    public function test_update_course(): void
    {
        $course = Course::factory()->create();
        $data = ['title' => 'Updated Title'];

        $updatedCourse = $this->courseService->updateCourse($course, $data);

        $this->assertEquals('Updated Title', $updatedCourse->title);
    }

    public function test_delete_course(): void
    {
        $course = Course::factory()->create();

        $result = $this->courseService->deleteCourse($course);

        $this->assertTrue($result);
        $this->assertSoftDeleted('courses', ['id' => $course->id]);
    }

    public function test_get_teacher_courses(): void
    {
        $teacher = User::factory()->teacher()->create();
        Course::factory()->count(3)->create(['teacher_id' => $teacher->id]);

        $courses = $this->courseService->getTeacherCourses($teacher);

        $this->assertCount(3, $courses);
    }
}
