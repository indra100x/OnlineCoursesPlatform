<?php

namespace App\Events;

use App\Models\Chapter;
use App\Models\Course;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChapterCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Chapter $chapter,
        public Course $course,
    ) {}
}
