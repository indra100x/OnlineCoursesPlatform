<?php

namespace App\Http\Controllers\Teacher;

use App\Events\ChapterCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\ChapterStoreRequest;
use App\Http\Resources\ChapterResource;
use App\Models\Chapter;
use App\Models\Course;
use App\Services\ChapterService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Storage;

class CourseChapterController extends Controller
{
    public function __construct(
        protected ChapterService $chapterService,
    ) {}

    public function index(Course $course): JsonResponse
    {
        $this->authorize('manageChapters', $course);

        $chapters = $course->chapters()->orderBy('position')->get();

        return response()->json(ChapterResource::collection($chapters));
    }

    public function show(Course $course, Chapter $chapter): BinaryFileResponse
    {
        $this->authorize('manageChapters', $course);

        abort_unless($chapter->course_id === $course->id, 404);

        $path = $chapter->file_path;

        if (str_starts_with($path, 'http')) {
            return redirect($path);
        }

        $fullPath = Storage::disk('public')->path($path);

        if (!file_exists($fullPath)) {
            abort(404, 'File not found.');
        }

        $mime = Storage::disk('public')->mimeType($path);

        return response()->file($fullPath, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $chapter->file_name . '"',
        ]);
    }

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
