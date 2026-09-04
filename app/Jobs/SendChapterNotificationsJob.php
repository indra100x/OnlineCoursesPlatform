<?php

namespace App\Jobs;

use App\Models\Chapter;
use App\Models\Course;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendChapterNotificationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(
        public Chapter $chapter,
        public Course $course,
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
            'chapter_id' => $this->chapter->id,
            'type' => Notification::TYPE_CHAPTER_CREATED,
            'data' => json_encode([
                'course_title' => $this->course->title,
                'chapter_title' => $this->chapter->title,
                'chapter_position' => $this->chapter->position,
            ]),
            'message' => "New chapter \"{$this->chapter->title}\" was added to {$this->course->title}.",
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Notification::insert($notifications->toArray());
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error("Failed to send chapter notifications for chapter {$this->chapter->id}: {$exception->getMessage()}");
    }
}
