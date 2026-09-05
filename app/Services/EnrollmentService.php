<?php

namespace App\Services;

use App\Exceptions\EnrollmentException;
use App\Models\Course;
use App\Models\CoursePurchase;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EnrollmentService
{
    public function __construct(
        private readonly CacheService $cache,
    ) {}

    public function purchaseCourse(User $student, Course $course): CoursePurchase
    {
        $purchase = CoursePurchase::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ], [
            'amount' => $course->price,
            'status' => CoursePurchase::STATUS_BETA_PAID,
            'reference' => 'BETA-'.Str::upper(Str::random(12)),
            'purchased_at' => now(),
        ]);

        $this->cache->invalidateCourseCache($course->id);
        $this->cache->invalidateUserCache($student->id);

        return $purchase;
    }

    public function enrollWithCode(User $student, string $code): Enrollment
    {
        return DB::transaction(function () use ($student, $code) {
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

            $enrollment = Enrollment::firstOrCreate([
                'student_id' => $student->id,
                'course_id' => $course->id,
            ], [
                'enrolled_at' => now(),
            ]);

            $this->cache->invalidateCourseCache($course->id);
            $this->cache->invalidateUserCache($student->id);

            return $enrollment;
        });
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

    public function getEnrolledStudents(Course $course): Collection
    {
        return $course->students()
            ->select('users.id', 'users.name', 'users.email', 'users.created_at')
            ->orderBy('users.name')
            ->get();
    }
}
