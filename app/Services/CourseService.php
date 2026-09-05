<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CourseService
{
    public function __construct(
        protected CacheService $cache,
    ) {}

    public function createCourse(User $teacher, array $data): Course
    {
        $course = new Course([
            'title' => $data['title'],
            'description' => $data['description'],
            'price' => $data['price'],
        ]);
        $course->teacher_id = $teacher->id;
        $course->save();

        $this->cache->invalidateAllUserCaches();
        $this->cache->invalidateTeacherCoursesCache($teacher->id);

        return $course;
    }

    public function updateCourse(Course $course, array $data): Course
    {
        $course->update($data);
        $this->cache->invalidateCourseCache($course->id);
        $this->cache->invalidateTeacherCoursesCache($course->teacher_id);

        return $course->fresh();
    }

    public function deleteCourse(Course $course): bool
    {
        $teacherId = $course->teacher_id;
        $result = $course->delete();
        $this->cache->invalidateCourseCache($course->id);
        $this->cache->invalidateTeacherCoursesCache($teacherId);

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

    public function getCatalogForStudent(User $student, int $perPage = 20): LengthAwarePaginator
    {
        $pageKey = "catalog:student:{$student->id}:page:".request()->input('page', 1).':per_page:'.$perPage;

        return $this->cache->remember(
            $pageKey,
            CacheService::CATALOG_TTL,
            fn () => Course::query()
                ->with(['teacher:id,name,avatar_path,bio'])
                ->withCount(['chapters', 'ratings'])
                ->withAvg('ratings', 'rating')
                ->withExists([
                    'purchases as is_purchased' => fn ($query) => $query->where('student_id', $student->id),
                    'wishlistItems as is_wishlisted' => fn ($query) => $query->where('student_id', $student->id),
                    'enrollments as is_enrolled' => fn ($query) => $query->where('student_id', $student->id),
                ])
                ->latest()
                ->paginate($perPage)
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

    public function getTeacherCoursesForStudent(User $teacher, User $student): Collection
    {
        return $this->cache->remember(
            $this->cache->getTeacherCoursesForStudentKey($teacher->id, $student->id),
            CacheService::TEACHER_COURSES_FOR_STUDENT_TTL,
            fn () => Course::query()
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
        );
    }
}
