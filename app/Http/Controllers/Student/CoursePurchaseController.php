<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePurchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CoursePurchaseController extends Controller
{
    public function store(Request $request, Course $course): JsonResponse
    {
        $student = $request->user();

        $purchase = CoursePurchase::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
        ], [
            'amount' => $course->price,
            'status' => CoursePurchase::STATUS_BETA_PAID,
            'reference' => 'BETA-'.Str::upper(Str::random(12)),
            'purchased_at' => now(),
        ]);

        return response()->json([
            'message' => $purchase->wasRecentlyCreated
                ? 'Beta purchase completed. Your enrollment code is now unlocked.'
                : 'You already purchased this course.',
            'purchase' => $purchase,
            'enrollment_code' => $course->enrollment_code,
        ], $purchase->wasRecentlyCreated ? 201 : 200);
    }
}
