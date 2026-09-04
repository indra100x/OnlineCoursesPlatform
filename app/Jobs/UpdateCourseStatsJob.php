<?php

namespace App\Jobs;

use App\Models\Course;
use App\Services\CacheService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateCourseStatsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(
        public int $courseId,
    ) {}

    public function handle(CacheService $cache): void
    {
        $course = Course::withCount(['chapters', 'enrollments', 'ratings'])
            ->withAvg('ratings', 'rating')
            ->find($this->courseId);

        if ($course) {
            $cache->invalidateCourseCache($this->courseId);
        }
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error("Failed to update course stats for course {$this->courseId}: {$exception->getMessage()}");
    }
}
