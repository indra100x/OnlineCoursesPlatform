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
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ]);

        $chapter = DB::transaction(function () use ($request, $course, $validated) {
            $nextPosition = (int) $course->chapters()->max('position') + 1;

            $storedFile = $request->file('file')->store('chapters', 'public');

            $chapter = Chapter::create([
                'course_id' => $course->id,
                'title' => $validated['title'],
                'position' => $nextPosition,
                'file_path' => $storedFile,
                'file_name' => $request->file('file')->getClientOriginalName(),
                'file_size' => $request->file('file')->getSize(),
            ]);

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
