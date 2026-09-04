<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class CleanupExpiredSessionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 120;

    public function handle(): void
    {
        $lifetime = config('session.lifetime', 120);

        DB::table('sessions')
            ->where('last_activity', '<', now()->subMinutes($lifetime)->timestamp)
            ->delete();
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error("Failed to cleanup expired sessions: {$exception->getMessage()}");
    }
}
