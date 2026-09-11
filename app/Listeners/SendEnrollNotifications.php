<?php

namespace App\Listeners;

use App\Events\CourseEnrolled;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendEnrollNotifications implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    public function __construct()
    {
        $this->queue = 'notifications';
    }

    public function handle(CourseEnrolled $event): void
    {
        $enrollment = $event->enrollment;
        $course = $enrollment->course;
        $student = $enrollment->student;

        Notification::firstOrCreate([
            'user_id' => $course->teacher_id,
            'type' => Notification::TYPE_COURSE_ENROLLED,
            'course_id' => $course->id,
            'message' => "{$student->name} enrolled in \"{$course->title}\".",
        ], [
            'data' => json_encode([
                'course_title' => $course->title,
                'student_name' => $student->name,
            ]),
        ]);
    }
}
