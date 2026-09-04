<?php

namespace App\Http\Controllers\Student;

use App\Events\CourseEnrolled;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\EnrollmentRequest;
use App\Http\Resources\CourseResource;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function __construct(
        protected EnrollmentService $enrollmentService,
    ) {}

    public function store(EnrollmentRequest $request): JsonResponse
    {
        $enrollment = $this->enrollmentService->enrollWithCode(
            $request->user(),
            $request->validated('enrollment_code')
        );

        if ($enrollment->wasRecentlyCreated) {
            CourseEnrolled::dispatch($enrollment);
        }

        return response()->json([
            'message' => $enrollment->wasRecentlyCreated
                ? 'Enrollment successful.'
                : 'You are already enrolled in this course.',
            'course' => new CourseResource($enrollment->course->load('teacher:id,name,email')),
        ], $enrollment->wasRecentlyCreated ? 201 : 200);
    }
}
