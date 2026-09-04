<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CourseService
{
    public function __construct(
        protected CacheService $cache,
    ) {}

    public function createCourse(User $teacher, array $data): Course
    {
        $course = Course::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'price' => $data['price'],
            'teacher_id' => $teacher->id,
        ]);

        $this->cache->invalidateAllUserCaches();

        return $course;
    }

    public function updateCourse(Course $course, array $data): Course
    {
        $course->update($data);
        $this->cache->invalidateCourseCache($course->id);

        return $course->fresh();
    }

    public function deleteCourse(Course $course): bool
    {
        $result = $course->delete();
        $this->cache->invalidateCourseCache($course->id);

        return $result;
    }

    public function getTeacherCourses(User $teacher): Collection
    {
        return $this->cache->remember(
            $this->cache->getTeacherCoursesKey($teacher->id),
            CacheService::TEACHER_COURSES_TTL,
            fn () => Course::query()
                ->where('teacher_id', $teacher->id)
                ->withCount(['chapters', 'enrollments', 'ratings'])
                ->withAvg('ratings', 'rating')
                ->latest()
                ->get()
        );
    }

    public function getCatalogForStudent(User $student): \Illuminate\Support\Collection
    {
        return $this->cache->remember(
            $this->cache->getCatalogKey($student->id),
            CacheService::CATALOG_TTL,
            fn () => Course::query()
                ->with(['teacher:id,name,email,avatar_path,bio'])
                ->withCount(['chapters', 'ratings'])
                ->withAvg('ratings', 'rating')
                ->withExists([
                    'purchases as is_purchased' => fn ($query) => $query->where('student_id', $student->id),
                    'wishlistItems as is_wishlisted' => fn ($query) => $query->where('student_id', $student->id),
                    'enrollments as is_enrolled' => fn ($query) => $query->where('student_id', $student->id),
                ])
                ->latest()
                ->get()
                ->map(fn (Course $course) => [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'price' => $course->price,
                    'teacher' => $course->teacher,
                    'chapters_count' => $course->chapters_count,
                    'ratings_count' => $course->ratings_count,
                    'ratings_avg_rating' => $course->ratings_avg_rating,
                    'is_purchased' => $course->is_purchased,
                    'is_wishlisted' => $course->is_wishlisted,
                    'is_enrolled' => $course->is_enrolled,
                    'enrollment_code' => $course->is_purchased ? $course->enrollment_code : null,
                    'created_at' => $course->created_at,
                ])
                ->values()
        );
    }

    public function getEnrolledCourses(User $student): Collection
    {
        return $this->cache->remember(
            $this->cache->getEnrolledCoursesKey($student->id),
            CacheService::ENROLLED_COURSES_TTL,
            fn () => Course::query()
                ->whereHas('enrollments', fn ($query) => $query->where('student_id', $student->id))
                ->with(['teacher:id,name,email,avatar_path,bio'])
                ->withCount(['chapters', 'ratings'])
                ->withAvg('ratings', 'rating')
                ->latest()
                ->get()
        );
    }

    public function getCourseWithDetails(int $courseId): ?Course
    {
        return $this->cache->remember(
            $this->cache->getCourseDetailKey($courseId),
            CacheService::COURSE_DETAIL_TTL,
            fn () => Course::query()
                ->with([
                    'teacher:id,name,email,avatar_path,bio',
                    'chapters' => fn ($query) => $query->orderBy('position'),
                    'ratings.student:id,name,avatar_path',
                ])
                ->withCount('ratings')
                ->withAvg('ratings', 'rating')
                ->find($courseId)
        );
    }

    public function getTeacherCoursesForStudent(User $teacher, User $student): \Illuminate\Support\Collection
    {
        return Course::query()
            ->where('teacher_id', $teacher->id)
            ->withCount(['chapters', 'ratings', 'enrollments'])
            ->withAvg('ratings', 'rating')
            ->withExists([
                'purchases as is_purchased' => fn ($query) => $query->where('student_id', $student->id),
                'wishlistItems as is_wishlisted' => fn ($query) => $query->where('student_id', $student->id),
                'enrollments as is_enrolled' => fn ($query) => $query->where('student_id', $student->id),
            ])
            ->latest()
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'price' => $course->price,
                'teacher_id' => $course->teacher_id,
                'chapters_count' => $course->chapters_count,
                'enrollments_count' => $course->enrollments_count,
                'ratings_count' => $course->ratings_count,
                'ratings_avg_rating' => $course->ratings_avg_rating,
                'is_purchased' => $course->is_purchased,
                'is_wishlisted' => $course->is_wishlisted,
                'is_enrolled' => $course->is_enrolled,
                'enrollment_code' => $course->is_purchased ? $course->enrollment_code : null,
                'created_at' => $course->created_at,
            ])
            ->values();
    }
}
