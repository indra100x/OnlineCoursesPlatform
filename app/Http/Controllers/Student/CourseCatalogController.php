<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\CourseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseCatalogController extends Controller
{
    public function __construct(
        protected CourseService $courseService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $courses = $this->courseService->getCatalogForStudent($request->user());

        return response()->json([
            'courses' => $courses,
        ]);
    }
}
