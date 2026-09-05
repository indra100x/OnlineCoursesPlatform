<?php

namespace App\Listeners;

use App\Events\CourseCreated;
use App\Events\CourseUpdated;
use App\Events\CourseDeleted;
use App\Jobs\RefreshCourseCacheJob;

class UpdateCourseStats
{
    public function handle(CourseCreated|CourseUpdated|CourseDeleted $event): void
    {
        $courseId = match (true) {
            $event instanceof CourseCreated => $event->course->id,
            $event instanceof CourseUpdated => $event->course->id,
            $event instanceof CourseDeleted => $event->courseId,
        };

        RefreshCourseCacheJob::dispatch($courseId);
    }
}
