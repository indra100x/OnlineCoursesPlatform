<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\WishlistStoreRequest;
use App\Http\Resources\CourseResource;
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
            'courses' => CourseResource::collection($courses),
        ]);
    }

    public function store(WishlistStoreRequest $request): JsonResponse
    {
        Wishlist::firstOrCreate([
            'student_id' => $request->user()->id,
            'course_id' => $request->validated('course_id'),
        ]);

        return response()->json([
            'message' => 'Course added to wishlist.',
        ], 201);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $deleted = Wishlist::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->delete();

        if ($deleted === 0) {
            return response()->json([
                'message' => 'Wishlist item not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Course removed from wishlist.',
        ]);
    }
}
