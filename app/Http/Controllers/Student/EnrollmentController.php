<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePurchase;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enrollment_code' => ['required', 'string', 'exists:courses,enrollment_code'],
        ]);

        $course = Course::query()
            ->where('enrollment_code', $validated['enrollment_code'])
            ->firstOrFail();

        $hasPurchased = CoursePurchase::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->exists();

        if (! $hasPurchased) {
            return response()->json([
                'message' => 'You must complete the beta purchase before using this enrollment code.',
            ], 403);
        }

        $enrollment = Enrollment::firstOrCreate([
            'student_id' => $request->user()->id,
            'course_id' => $course->id,
        ], [
            'enrolled_at' => now(),
        ]);

        return response()->json([
            'message' => $enrollment->wasRecentlyCreated
                ? 'Enrollment successful.'
                : 'You are already enrolled in this course.',
            'course' => $course->load('teacher:id,name,email'),
        ], $enrollment->wasRecentlyCreated ? 201 : 200);
    }
}
