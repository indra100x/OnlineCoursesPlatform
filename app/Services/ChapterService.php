<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Course;
use App\Support\MediaStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ChapterService
{
    public function __construct(
        protected MediaStorage $mediaStorage,
    ) {}

    public function createChapter(Course $course, array $data, UploadedFile $file): Chapter
    {
        return DB::transaction(function () use ($course, $data, $file) {
            $nextPosition = (int) $course->chapters()->max('position') + 1;

            $storedFile = $this->mediaStorage->storeDocument($file, 'chapters');

            $chapter = Chapter::create([
                'course_id' => $course->id,
                'title' => $data['title'],
                'position' => $nextPosition,
                'file_path' => $storedFile,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
            ]);

            return $chapter;
        });
    }
}
