<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function update(User $teacher, Course $course): bool
    {
        return $course->teacher_id === $teacher->id;
    }

    public function delete(User $teacher, Course $course): bool
    {
        return $course->teacher_id === $teacher->id;
    }

    public function manageChapters(User $teacher, Course $course): bool
    {
        return $course->teacher_id === $teacher->id;
    }

    public function viewStudents(User $teacher, Course $course): bool
    {
        return $course->teacher_id === $teacher->id;
    }
}
