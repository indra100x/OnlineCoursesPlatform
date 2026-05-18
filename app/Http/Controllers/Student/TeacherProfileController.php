<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherProfileController extends Controller
{
    public function show(Request $request, User $teacher): JsonResponse
    {
        abort_unless($teacher->isTeacher(), 404);

        $student = $request->user();

        $courses = Course::query()
            ->where('teacher_id', $teacher->id)
            ->withCount(['chapters', 'ratings', 'enrollments'])
            ->withAvg('ratings', 'rating')
            ->latest()
            ->get()
            ->map(function (Course $course) use ($student) {
                $hasPurchased = $course->purchases()->where('student_id', $student->id)->exists();
                $isWishlisted = $course->wishlistItems()->where('student_id', $student->id)->exists();
                $isEnrolled = $course->enrollments()->where('student_id', $student->id)->exists();

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'price' => $course->price,
                    'teacher_id' => $course->teacher_id,
                    'chapters_count' => $course->chapters_count,
                    'enrollments_count' => $course->enrollments_count,
                    'ratings_count' => $course->ratings_count,
                    'ratings_avg_rating' => $course->ratings_avg_rating,
                    'is_purchased' => $hasPurchased,
                    'is_wishlisted' => $isWishlisted,
                    'is_enrolled' => $isEnrolled,
                    'enrollment_code' => $hasPurchased ? $course->enrollment_code : null,
                    'created_at' => $course->created_at,
                ];
            })
            ->values();

        return response()->json([
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'bio' => $teacher->bio,
                'avatar_path' => $teacher->avatar_path,
                'created_at' => $teacher->created_at,
            ],
            'courses' => $courses,
        ]);
    }
}
