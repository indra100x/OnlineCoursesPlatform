<?php

namespace App\Http\Controllers\Student;

use App\Events\CoursePurchased;
use App\Http\Controllers\Controller;
use App\Http\Resources\CoursePurchaseResource;
use App\Models\Course;
use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoursePurchaseController extends Controller
{
    public function __construct(
        protected EnrollmentService $enrollmentService,
    ) {}

    public function store(Request $request, Course $course): JsonResponse
    {
        $purchase = $this->enrollmentService->purchaseCourse($request->user(), $course);

        if ($purchase->wasRecentlyCreated) {
            CoursePurchased::dispatch($purchase);
        }

        return response()->json([
            'message' => $purchase->wasRecentlyCreated
                ? 'Beta purchase completed. Your enrollment code is now unlocked.'
                : 'You already purchased this course.',
            'purchase' => new CoursePurchaseResource($purchase),
            'enrollment_code' => $course->enrollment_code,
        ], $purchase->wasRecentlyCreated ? 201 : 200);
    }
}
