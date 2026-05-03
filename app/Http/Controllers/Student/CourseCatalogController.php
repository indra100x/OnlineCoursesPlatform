<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseCatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user();

        $courses = Course::query()
            ->with(['teacher:id,name,email,avatar_path,bio'])
            ->withCount(['chapters', 'ratings'])
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
                    'teacher' => $course->teacher,
                    'chapters_count' => $course->chapters_count,
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
            'courses' => $courses,
        ]);
    }
}
