<?php

namespace App\Http\Controllers\Teacher;

use App\Events\ChapterCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\ChapterStoreRequest;
use App\Http\Resources\ChapterResource;
use App\Models\Course;
use App\Services\ChapterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseChapterController extends Controller
{
    public function __construct(
        protected ChapterService $chapterService,
    ) {}

    public function store(ChapterStoreRequest $request, Course $course): JsonResponse
    {
        $this->authorize('manageChapters', $course);

        $chapter = $this->chapterService->createChapter(
            $course,
            $request->validated(),
            $request->file('file')
        );

        ChapterCreated::dispatch($chapter, $course);

        return response()->json([
            'message' => 'Chapter created successfully.',
            'chapter' => new ChapterResource($chapter),
        ], 201);
    }
}
