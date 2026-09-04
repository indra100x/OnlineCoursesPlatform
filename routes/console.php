<?php

use App\Jobs\CleanupExpiredSessionsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new CleanupExpiredSessionsJob)->daily();
Schedule::command('cache:prune-stale-tags')->hourly();
