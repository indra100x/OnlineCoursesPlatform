<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CourseStudentController extends Controller
{
    public function __construct(
        protected EnrollmentService $enrollmentService,
    ) {}

    public function index(Request $request, Course $course): JsonResponse
    {
        abort_unless($course->teacher_id === $request->user()->id, 403);

        return response()->json([
            'course' => new CourseResource($course->load('chapters', 'ratings', 'enrollments')),
            'students' => $this->enrollmentService->getEnrolledStudents($course),
        ]);
    }
}
