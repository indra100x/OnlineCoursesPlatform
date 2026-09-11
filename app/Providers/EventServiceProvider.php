<?php

namespace App\Providers;

use App\Events\ChapterCreated;
use App\Events\CourseCreated;
use App\Events\CourseDeleted;
use App\Events\CourseDeleting;
use App\Events\CourseEnrolled;
use App\Events\CoursePurchased;
use App\Events\CourseUpdated;
use App\Events\RatingSubmitted;
use App\Listeners\LogAuditActivity;
use App\Listeners\SendChapterNotifications;
use App\Listeners\SendCourseDeleteNotifications;
use App\Listeners\SendCourseUpdateNotifications;
use App\Listeners\SendEnrollNotifications;
use App\Listeners\SendPurchaseNotifications;
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
            SendCourseUpdateNotifications::class,
            UpdateCourseStats::class,
            LogAuditActivity::class,
        ],
        CourseDeleting::class => [
            SendCourseDeleteNotifications::class,
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
            SendPurchaseNotifications::class,
            LogAuditActivity::class,
        ],
        CourseEnrolled::class => [
            SendEnrollNotifications::class,
            LogAuditActivity::class,
        ],
        RatingSubmitted::class => [
            LogAuditActivity::class,
        ],
    ];

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
