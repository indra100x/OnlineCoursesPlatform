<?php

namespace App\Listeners;

use App\Events\CourseUpdated;
use App\Jobs\SendCourseChangeNotificationsJob;

class SendCourseUpdateNotifications
{
    public function handle(CourseUpdated $event): void
    {
        $course = $event->course;

        SendCourseChangeNotificationsJob::dispatch(
            $course,
            'course_updated',
            "Course \"{$course->title}\" has been updated.",
            [
                'course_title' => $course->title,
            ]
        )->onQueue('notifications');
    }
}
