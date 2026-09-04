<?php

namespace App\Providers;

use App\Events\ChapterCreated;
use App\Events\CourseCreated;
use App\Events\CourseDeleted;
use App\Events\CourseEnrolled;
use App\Events\CoursePurchased;
use App\Events\CourseUpdated;
use App\Events\RatingSubmitted;
use App\Listeners\LogAuditActivity;
use App\Listeners\SendChapterNotifications;
use App\Listeners\UpdateCourseStats;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        CourseCreated::class => [
            UpdateCourseStats::class,
            LogAuditActivity::class,
        ],
        CourseUpdated::class => [
            UpdateCourseStats::class,
            LogAuditActivity::class,
        ],
        CourseDeleted::class => [
            UpdateCourseStats::class,
            LogAuditActivity::class,
        ],
        ChapterCreated::class => [
            SendChapterNotifications::class,
            LogAuditActivity::class,
        ],
        CoursePurchased::class => [
            LogAuditActivity::class,
        ],
        CourseEnrolled::class => [
            LogAuditActivity::class,
        ],
        RatingSubmitted::class => [
            LogAuditActivity::class,
        ],
    ];
}
