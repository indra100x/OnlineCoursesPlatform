<?php

namespace App\Events;

use App\Models\Course;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CourseDeleted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $courseId,
    ) {}
}
