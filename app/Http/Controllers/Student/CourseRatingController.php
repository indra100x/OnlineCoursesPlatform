<?php

namespace App\Http\Controllers\Student;

use App\Events\RatingSubmitted;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\RatingStoreRequest;
use App\Http\Resources\RatingResource;
use App\Models\Course;
use App\Models\CourseRating;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;

class CourseRatingController extends Controller
{
    public function __construct(
        protected EnrollmentService $enrollmentService,
    ) {}

    public function store(RatingStoreRequest $request, Course $course): JsonResponse
    {
        $student = $request->user();

        abort_unless(
            $this->enrollmentService->isEnrolled($student, $course),
            403,
            'You must be enrolled before rating this course.',
        );

        $rating = CourseRating::updateOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ], $request->validated());

        RatingSubmitted::dispatch($rating);

        return response()->json([
            'message' => 'Course rating saved successfully.',
            'rating' => new RatingResource($rating),
        ]);
    }
}
