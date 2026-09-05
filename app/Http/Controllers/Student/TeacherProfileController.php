<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeacherResource;
use App\Models\User;
use App\Services\CourseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherProfileController extends Controller
{
    public function __construct(
        protected CourseService $courseService,
    ) {}

    public function show(Request $request, User $teacher): JsonResponse
    {
        abort_unless($teacher->isTeacher(), 404);

        $courses = $this->courseService->getTeacherCoursesForStudent($teacher, $request->user());

        return response()->json([
            'teacher' => new TeacherResource($teacher),
            'courses' => $courses,
        ]);
    }
}
