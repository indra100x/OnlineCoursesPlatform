<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseRatingController extends Controller
{
    public function store(Request $request, Course $course): JsonResponse
    {
        $student = $request->user();
        $isEnrolled = $course->enrollments()->where('student_id', $student->id)->exists();

        abort_unless($isEnrolled, 403, 'You must be enrolled before rating this course.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'review' => ['nullable', 'string', 'max:2000'],
        ]);

        $rating = CourseRating::updateOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ], $validated);

        return response()->json([
            'message' => 'Course rating saved successfully.',
            'rating' => $rating,
        ]);
    }
}
