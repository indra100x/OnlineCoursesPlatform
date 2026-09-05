<?php

namespace App\Listeners;

use App\Events\CourseCreated;
use App\Events\CourseUpdated;
use App\Events\CourseDeleted;
use App\Events\ChapterCreated;
use App\Events\CoursePurchased;
use App\Events\CourseEnrolled;
use App\Events\RatingSubmitted;
use App\Services\AuditLogService;

class LogAuditActivity
{
    public function handle(CourseCreated|CourseUpdated|CourseDeleted|ChapterCreated|CoursePurchased|CourseEnrolled|RatingSubmitted $event): void
    {
        $action = match (true) {
            $event instanceof CourseCreated => 'course_created',
            $event instanceof CourseUpdated => 'course_updated',
            $event instanceof CourseDeleted => 'course_deleted',
            $event instanceof ChapterCreated => 'chapter_created',
            $event instanceof CoursePurchased => 'course_purchased',
            $event instanceof CourseEnrolled => 'course_enrolled',
            $event instanceof RatingSubmitted => 'rating_submitted',
        };

        $auditable = match (true) {
            $event instanceof CourseDeleted => null,
            default => $event->course ?? $event->chapter ?? $event->purchase ?? $event->enrollment ?? $event->rating,
        };

        AuditLogService::log(
            action: $action,
            auditableType: $auditable ? get_class($auditable) : null,
            auditableId: $auditable?->getKey(),
            newValues: $auditable?->toArray() ?? [],
        );
    }
}
