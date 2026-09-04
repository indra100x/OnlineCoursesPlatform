<?php

namespace App\Listeners;

use App\Events\ChapterCreated;
use App\Jobs\SendChapterNotificationsJob;

class SendChapterNotifications
{
    public function handle(ChapterCreated $event): void
    {
        SendChapterNotificationsJob::dispatch(
            $event->chapter,
            $event->course
        )->onQueue('notifications');
    }
}
