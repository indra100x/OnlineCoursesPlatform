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
            ->withExists([
                'purchases as is_purchased' => fn ($query) => $query->where('student_id', $student->id),
                'wishlistItems as is_wishlisted' => fn ($query) => $query->where('student_id', $student->id),
                'enrollments as is_enrolled' => fn ($query) => $query->where('student_id', $student->id),
            ])
            ->latest()
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'price' => $course->price,
                'teacher' => $course->teacher,
                'chapters_count' => $course->chapters_count,
                'ratings_count' => $course->ratings_count,
                'ratings_avg_rating' => $course->ratings_avg_rating,
                'is_purchased' => $course->is_purchased,
                'is_wishlisted' => $course->is_wishlisted,
                'is_enrolled' => $course->is_enrolled,
                'enrollment_code' => $course->is_purchased ? $course->enrollment_code : null,
                'created_at' => $course->created_at,
            ])
            ->values();

        return response()->json([
            'courses' => $courses,
        ]);
    }
}
