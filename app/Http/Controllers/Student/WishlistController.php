<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->whereHas('wishlistItems', fn ($query) => $query->where('student_id', $request->user()->id))
            ->with(['teacher:id,name,email,avatar_path,bio'])
            ->withCount(['chapters', 'ratings'])
            ->withAvg('ratings', 'rating')
            ->latest()
            ->get();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
        ]);

        Wishlist::firstOrCreate([
            'student_id' => $request->user()->id,
            'course_id' => $validated['course_id'],
        ]);

        return response()->json([
            'message' => 'Course added to wishlist.',
        ], 201);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        Wishlist::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->delete();

        return response()->json([
            'message' => 'Course removed from wishlist.',
        ]);
    }
}
