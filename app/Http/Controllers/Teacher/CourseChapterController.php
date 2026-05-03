<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Course;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseChapterController extends Controller
{
    public function store(Request $request, Course $course): JsonResponse
    {
        abort_unless($course->teacher_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content_type' => ['required', 'in:text,video,file'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url', 'max:2048'],
            'file' => ['nullable', 'file', 'max:10240'],
        ]);

        if ($validated['content_type'] === 'text') {
            $request->validate(['content' => ['required', 'string']]);
        }

        if ($validated['content_type'] === 'video') {
            $request->validate(['video_url' => ['required', 'url', 'max:2048']]);
        }

        if ($validated['content_type'] === 'file') {
            $request->validate(['file' => ['required', 'file', 'max:10240']]);
        }

        $chapter = DB::transaction(function () use ($request, $course, $validated) {
            $nextPosition = (int) $course->chapters()->max('position') + 1;

            $chapterData = [
                'course_id' => $course->id,
                'title' => $validated['title'],
                'position' => $nextPosition,
                'content_type' => $validated['content_type'],
                'content' => $validated['content_type'] === 'text' ? $validated['content'] : null,
                'video_url' => $validated['content_type'] === 'video' ? $validated['video_url'] : null,
                'file_path' => null,
                'file_name' => null,
            ];

            if ($validated['content_type'] === 'file' && $request->file('file')) {
                $storedFile = $request->file('file')->store('chapters', 'public');
                $chapterData['file_path'] = $storedFile;
                $chapterData['file_name'] = $request->file('file')->getClientOriginalName();
            }

            $chapter = Chapter::create($chapterData);

            $students = $course->students()->select('users.id')->get();

            foreach ($students as $student) {
                Notification::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'chapter_id' => $chapter->id,
                    'type' => Notification::TYPE_CHAPTER_CREATED,
                    'data' => [
                        'course_title' => $course->title,
                        'chapter_title' => $chapter->title,
                        'chapter_position' => $chapter->position,
                    ],
                    'message' => "New chapter \"{$chapter->title}\" was added to {$course->title}.",
                ]);
            }

            return $chapter;
        });

        return response()->json([
            'message' => 'Chapter created successfully.',
            'chapter' => $chapter,
        ], 201);
    }
}
