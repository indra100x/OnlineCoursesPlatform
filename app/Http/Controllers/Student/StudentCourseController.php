<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentCourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->whereHas('enrollments', fn ($query) => $query->where('student_id', $request->user()->id))
            ->with(['teacher:id,name,email'])
            ->withCount('chapters')
            ->latest()
            ->get();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    public function chapters(Request $request, Course $course): JsonResponse
    {
        $isEnrolled = $course->enrollments()
            ->where('student_id', $request->user()->id)
            ->exists();

        abort_unless($isEnrolled, 403);

        return response()->json([
            'course' => $course->load([
                'teacher:id,name,email',
                'chapters' => fn ($query) => $query->orderBy('position'),
            ]),
        ]);
    }
}
