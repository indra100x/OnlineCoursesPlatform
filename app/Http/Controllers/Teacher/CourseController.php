<?php

namespace App\Http\Controllers\Teacher;

use App\Events\CourseCreated;
use App\Events\CourseUpdated;
use App\Events\CourseDeleted;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\CourseStoreRequest;
use App\Http\Requests\Teacher\CourseUpdateRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\CourseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CourseController extends Controller
{
    public function __construct(
        protected CourseService $courseService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $courses = $this->courseService->getTeacherCourses($request->user());

        return CourseResource::collection($courses);
    }

    public function store(CourseStoreRequest $request): JsonResponse
    {
        $course = $this->courseService->createCourse($request->user(), $request->validated());

        CourseCreated::dispatch($course);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => new CourseResource($course->loadCount(['chapters', 'enrollments', 'ratings'])->loadAvg('ratings', 'rating')),
        ], 201);
    }

    public function update(CourseUpdateRequest $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $course = $this->courseService->updateCourse($course, $request->validated());

        CourseUpdated::dispatch($course);

        return response()->json([
            'message' => 'Course updated successfully.',
            'course' => new CourseResource($course->loadCount(['chapters', 'enrollments', 'ratings'])->loadAvg('ratings', 'rating')),
        ]);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $this->authorize('delete', $course);

        $courseId = $course->id;
        $this->courseService->deleteCourse($course);

        CourseDeleted::dispatch($courseId);

        return response()->json([
            'message' => 'Course deleted successfully.',
        ]);
    }
}
