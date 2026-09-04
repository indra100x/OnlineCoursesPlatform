<?php

namespace Tests\Feature\Teacher;

use App\Models\Course;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ChapterCreationTest extends TestCase
{
    public function test_teacher_can_create_chapter(): void
    {
        Storage::fake('local');
        $teacher = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);

        $file = UploadedFile::fake()->create('chapter.pdf', 100, 'application/pdf');

        $response = $this->actingAs($teacher)->postJson("/courses/{$course->id}/chapters", [
            'title' => 'Introduction to Laravel',
            'file' => $file,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('chapters', [
            'course_id' => $course->id,
            'title' => 'Introduction to Laravel',
        ]);
    }

    public function test_teacher_cannot_create_chapter_for_other_teacher_course(): void
    {
        Storage::fake('local');
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher2->id]);

        $file = UploadedFile::fake()->create('chapter.pdf', 100, 'application/pdf');

        $response = $this->actingAs($teacher1)->postJson("/courses/{$course->id}/chapters", [
            'title' => 'Hacked Chapter',
            'file' => $file,
        ]);

        $response->assertForbidden();
    }

    public function test_chapter_requires_title_and_file(): void
    {
        $teacher = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($teacher)->postJson("/courses/{$course->id}/chapters", []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title', 'file']);
    }

    public function test_chapter_file_must_be_pdf(): void
    {
        Storage::fake('local');
        $teacher = $this->createTeacher();
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);

        $file = UploadedFile::fake()->create('chapter.txt', 100, 'text/plain');

        $response = $this->actingAs($teacher)->postJson("/courses/{$course->id}/chapters", [
            'title' => 'Bad File Chapter',
            'file' => $file,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file']);
    }

    public function test_student_cannot_create_chapter(): void
    {
        Storage::fake('local');
        $student = $this->createStudent();
        $course = Course::factory()->create();

        $file = UploadedFile::fake()->create('chapter.pdf', 100, 'application/pdf');

        $response = $this->actingAs($student)->postJson("/courses/{$course->id}/chapters", [
            'title' => 'Student Chapter',
            'file' => $file,
        ]);

        $response->assertForbidden();
    }
}
