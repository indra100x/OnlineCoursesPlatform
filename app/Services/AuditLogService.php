<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\TeacherRequest;
use App\Models\User;

class AuditLogService
{
    public static function log(
        string $action,
        ?string $auditableType = null,
        int|null $auditableId = null,
        array $newValues = [],
        ?int $userId = null,
        ?string $ip = null,
        ?string $userAgent = null,
        ?array $oldValues = null,
    ): void {
        dispatch(fn () => AuditLog::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ip ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
        ]));
    }

    public static function logLogin(int $userId): void
    {
        static::log('user_login', User::class, $userId, [], $userId);
    }

    public static function logLogout(int $userId): void
    {
        static::log('user_logout', User::class, $userId, [], $userId);
    }

    public static function logPasswordChanged(int $userId): void
    {
        static::log('password_changed', User::class, $userId, [], $userId);
    }

    public static function logProfileUpdated(int $userId, array $changes): void
    {
        static::log('profile_updated', User::class, $userId, $changes, $userId);
    }

    public static function logUserCreated(int $adminId, int $newUserId, string $role): void
    {
        static::log('user_created_by_admin', User::class, $newUserId, ['role' => $role], $adminId);
    }

    public static function logUserDeleted(int $adminId, int $deletedUserId): void
    {
        static::log('user_deleted_by_admin', User::class, $deletedUserId, [], $adminId);
    }

    public static function logUserUpdated(int $adminId, int $targetUserId, array $changes): void
    {
        static::log('user_updated_by_admin', User::class, $targetUserId, $changes, $adminId);
    }

    public static function logTeacherRequestApproved(int $adminId, int $requestId): void
    {
        static::log('teacher_request_approved', TeacherRequest::class, $requestId, [], $adminId);
    }

    public static function logTeacherRequestRejected(int $adminId, int $requestId): void
    {
        static::log('teacher_request_rejected', TeacherRequest::class, $requestId, [], $adminId);
    }

    public static function getRecent(int $days = 7, int $limit = 50): \Illuminate\Support\Collection
    {
        return AuditLog::query()
            ->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
