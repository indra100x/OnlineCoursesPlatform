<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\WishlistStoreRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function __construct(
        protected WishlistService $wishlistService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $courses = $this->wishlistService->getWishlistForStudent($request->user());

        return response()->json([
            'courses' => CourseResource::collection($courses),
        ]);
    }

    public function store(WishlistStoreRequest $request): JsonResponse
    {
        $this->wishlistService->addToWishlist($request->user(), $request->validated('course_id'));

        return response()->json([
            'message' => 'Course added to wishlist.',
        ], 201);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $deleted = $this->wishlistService->removeFromWishlist($request->user(), $course);

        if (! $deleted) {
            return response()->json([
                'message' => 'Wishlist item not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Course removed from wishlist.',
        ]);
    }
}
