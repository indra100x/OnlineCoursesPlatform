<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->where('teacher_id', $request->user()->id)
            ->withCount(['chapters', 'enrollments'])
            ->latest()
            ->get();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ]);

        $course = Course::create([
            ...$validated,
            'teacher_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => $course->loadCount(['chapters', 'enrollments']),
        ], 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        abort_unless($course->teacher_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
        ]);

        $course->update($validated);

        return response()->json([
            'message' => 'Course updated successfully.',
            'course' => $course->fresh()->loadCount(['chapters', 'enrollments']),
        ]);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        abort_unless($course->teacher_id === $request->user()->id, 403);

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully.',
        ]);
    }
}
