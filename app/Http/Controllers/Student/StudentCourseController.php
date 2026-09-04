<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\CourseService;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StudentCourseController extends Controller
{
    public function __construct(
        protected CourseService $courseService,
        protected EnrollmentService $enrollmentService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $courses = $this->courseService->getEnrolledCourses($request->user());

        return CourseResource::collection($courses);
    }

    public function chapters(Request $request, Course $course): JsonResponse
    {
        $isEnrolled = $this->enrollmentService->isEnrolled($request->user(), $course);

        abort_unless($isEnrolled, 403);

        $courseDetails = $this->courseService->getCourseWithDetails($course->id);

        return response()->json([
            'course' => $courseDetails ? new CourseResource($courseDetails) : null,
        ]);
    }
}
