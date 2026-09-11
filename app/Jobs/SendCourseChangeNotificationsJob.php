<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;

class SendCourseChangeNotificationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(
        public Course $course,
        public string $type,
        public string $message,
        public array $data = [],
    ) {}

    public function handle(): void
    {
        $students = $this->course->students()->select('users.id')->get();

        if ($students->isEmpty()) {
            return;
        }

        $notifications = $students->map(fn ($student) => [
            'user_id' => $student->id,
            'course_id' => $this->course->id,
            'chapter_id' => null,
            'type' => $this->type,
            'data' => json_encode($this->data),
            'message' => $this->message,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Notification::insertOrIgnore($notifications->toArray());
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error("Failed to send course change notifications for course {$this->course->id}: {$exception->getMessage()}");
    }
}
