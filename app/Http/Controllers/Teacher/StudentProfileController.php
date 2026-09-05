<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentProfileController extends Controller
{
    public function show(Request $request, User $student): JsonResponse
    {
        abort_unless($student->isStudent(), 404);

        $teacher = $request->user();

        $isEnrolled = $student->enrollments()
            ->whereHas('course', fn ($query) => $query->where('teacher_id', $teacher->id))
            ->exists();

        abort_unless($isEnrolled, 403);

        $courses = $student->enrollments()
            ->whereHas('course', fn ($query) => $query->where('teacher_id', $teacher->id))
            ->with(['course' => function ($query) {
                $query->withCount(['chapters', 'ratings', 'enrollments'])
                    ->withAvg('ratings', 'rating');
            }])
            ->latest('enrollments.created_at')
            ->get()
            ->map(fn ($enrollment) => $enrollment->course)
            ->values();

        abort_if($courses->isEmpty(), 403);

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'bio' => $student->bio,
                'avatar_path' => $student->avatar_path,
                'created_at' => $student->created_at,
            ],
            'courses' => CourseResource::collection($courses),
        ]);
    }
}
