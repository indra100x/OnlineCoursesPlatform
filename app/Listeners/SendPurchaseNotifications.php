<?php

namespace App\Listeners;

use App\Events\CoursePurchased;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendPurchaseNotifications implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    public function __construct()
    {
        $this->queue = 'notifications';
    }

    public function handle(CoursePurchased $event): void
    {
        $purchase = $event->purchase;
        $course = $purchase->course;
        $student = $purchase->student;

        Notification::firstOrCreate([
            'user_id' => $course->teacher_id,
            'type' => Notification::TYPE_COURSE_PURCHASED,
            'course_id' => $course->id,
            'message' => "{$student->name} purchased \"{$course->title}\".",
        ], [
            'data' => json_encode([
                'course_title' => $course->title,
                'student_name' => $student->name,
            ]),
        ]);
    }
}
