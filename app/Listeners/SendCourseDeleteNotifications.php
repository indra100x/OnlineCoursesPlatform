<?php

namespace App\Listeners;

use App\Events\CourseDeleting;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendCourseDeleteNotifications implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    public function __construct()
    {
        $this->queue = 'notifications';
    }

    public function handle(CourseDeleting $event): void
    {
        $course = $event->course;

        $students = $course->students()->select('users.id')->get();

        if ($students->isEmpty()) {
            return;
        }

        $notifications = $students->map(fn ($student) => [
            'user_id' => $student->id,
            'course_id' => $course->id,
            'chapter_id' => null,
            'type' => Notification::TYPE_COURSE_DELETED,
            'data' => json_encode([
                'course_id' => $course->id,
                'course_title' => $course->title,
            ]),
            'message' => "The course \"{$course->title}\" you were enrolled in has been deleted.",
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Notification::insertOrIgnore($notifications->toArray());
    }
}
