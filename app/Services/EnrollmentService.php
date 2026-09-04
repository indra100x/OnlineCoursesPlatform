<?php

namespace App\Services;

use App\Exceptions\EnrollmentException;
use App\Models\Course;
use App\Models\CoursePurchase;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Support\Str;

class EnrollmentService
{
    public function purchaseCourse(User $student, Course $course): CoursePurchase
    {
        return CoursePurchase::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ], [
            'amount' => $course->price,
            'status' => CoursePurchase::STATUS_BETA_PAID,
            'reference' => 'BETA-'.Str::upper(Str::random(12)),
            'purchased_at' => now(),
        ]);
    }

    public function enrollWithCode(User $student, string $code): Enrollment
    {
        $course = Course::query()
            ->where('enrollment_code', $code)
            ->firstOrFail();

        $hasPurchased = CoursePurchase::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->exists();

        if (! $hasPurchased) {
            throw new EnrollmentException('You must complete the beta purchase before using this enrollment code.', 403);
        }

        return Enrollment::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ], [
            'enrolled_at' => now(),
        ]);
    }

    public function hasPurchased(User $student, Course $course): bool
    {
        return CoursePurchase::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->exists();
    }

    public function isEnrolled(User $student, Course $course): bool
    {
        return Enrollment::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->exists();
    }

    public function getEnrolledStudents(Course $course): \Illuminate\Database\Eloquent\Collection
    {
        return $course->students()
            ->select('users.id', 'users.name', 'users.email', 'users.created_at')
            ->orderBy('users.name')
            ->get();
    }
}
