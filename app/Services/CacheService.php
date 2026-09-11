<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    const CATALOG_TTL = 300; // 5 minutes

    const COURSE_DETAIL_TTL = 600; // 10 minutes

    const USER_STATS_TTL = 300; // 5 minutes

    const TEACHER_COURSES_TTL = 300; // 5 minutes

    const TEACHER_COURSES_FOR_STUDENT_TTL = 300; // 5 minutes

    const ENROLLED_COURSES_TTL = 300; // 5 minutes

    const NOTIFICATION_COUNT_TTL = 60; // 1 minute

    public function getCatalogKey(int $studentId): string
    {
        return "catalog:student:{$studentId}";
    }

    public function getCourseDetailKey(int $courseId): string
    {
        return "course:detail:{$courseId}";
    }

    public function getTeacherCoursesKey(int $teacherId): string
    {
        return "courses:teacher:{$teacherId}";
    }

    public function getTeacherCoursesForStudentKey(int $teacherId, int $studentId): string
    {
        return "courses:teacher:{$teacherId}:student:{$studentId}";
    }

    public function getEnrolledCoursesKey(int $studentId): string
    {
        return "courses:enrolled:{$studentId}";
    }

    public function getNotificationCountKey(int $userId): string
    {
        return "notifications:unread:{$userId}";
    }

    public function getUserStatsKey(): string
    {
        return 'stats:users';
    }

    public function getWishlistKey(int $studentId): string
    {
        return "wishlist:student:{$studentId}";
    }

    public function remember(string $key, int $ttl, callable $callback)
    {
        try {
            $value = Cache::remember($key, $ttl, $callback);

            if (get_debug_type($value) === '__PHP_Incomplete_Class') {
                Cache::forget($key);
                $value = Cache::remember($key, $ttl, $callback);
            }

            return $value;
        } catch (\TypeError) {
            Cache::forget($key);
            return Cache::remember($key, $ttl, $callback);
        }
    }

    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    public function forgetPattern(string $pattern): void
    {
        try {
            $store = Cache::getStore();

            if (method_exists($store, 'getRedis')) {
                $redis = $store->getRedis();
                $prefix = $redis->getOption('prefix') ?? '';

                $iterator = null;
                $fullPattern = '*'.$prefix.$pattern.'*';

                do {
                    [$iterator, $keys] = $redis->scan($iterator, ['MATCH' => $fullPattern, 'COUNT' => 100]);

                    foreach ($keys as $key) {
                        $rawKey = str_replace($prefix, '', $key);
                        Cache::forget($rawKey);
                    }
                } while ($iterator);
            }
        } catch (\Throwable) {
            // Array/flat cache driver doesn't support key scanning
        }
    }

    public function invalidateCourseCache(int $courseId): void
    {
        $this->forget($this->getCourseDetailKey($courseId));
        $this->forgetPattern('catalog:student:');
    }

    public function invalidateTeacherCoursesCache(int $teacherId): void
    {
        $this->forget($this->getTeacherCoursesKey($teacherId));
        $this->forgetPattern("courses:teacher:{$teacherId}:student:");
    }

    public function invalidateUserCache(int $userId): void
    {
        $this->forget($this->getNotificationCountKey($userId));
        $this->forget($this->getWishlistKey($userId));
        $this->forget($this->getEnrolledCoursesKey($userId));
    }

    public function invalidateAllUserCaches(): void
    {
        $this->forgetPattern('catalog:student:');
        $this->forget($this->getUserStatsKey());
    }

    public function invalidateAllCatalogCaches(): void
    {
        $this->forgetPattern('catalog:student:');
    }
}
