<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
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
            ->map(fn ($enrollment) => [
                'id' => $enrollment->course->id,
                'title' => $enrollment->course->title,
                'description' => $enrollment->course->description,
                'price' => $enrollment->course->price,
                'enrollment_code' => $enrollment->course->enrollment_code,
                'chapters_count' => $enrollment->course->chapters_count,
                'enrollments_count' => $enrollment->course->enrollments_count,
                'ratings_count' => $enrollment->course->ratings_count,
                'ratings_avg_rating' => $enrollment->course->ratings_avg_rating,
                'enrolled_at' => $enrollment->created_at,
                'created_at' => $enrollment->course->created_at,
            ])
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
            'courses' => $courses,
        ]);
    }
}
