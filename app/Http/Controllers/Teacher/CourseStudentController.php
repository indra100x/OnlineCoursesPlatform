<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseStudentController extends Controller
{
    public function index(Request $request, Course $course): JsonResponse
    {
        abort_unless($course->teacher_id === $request->user()->id, 403);

        return response()->json([
            'course' => $course->only(['id', 'title', 'enrollment_code']),
            'students' => $course->students()
                ->select('users.id', 'users.name', 'users.email', 'users.created_at')
                ->orderBy('users.name')
                ->get(),
        ]);
    }
}
