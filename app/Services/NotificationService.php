<?php

namespace App\Services;

use App\Exceptions\AuthorizationException;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public function __construct(
        protected CacheService $cache,
    ) {}

    public function getNotifications(User $user, int $limit = 50): Collection
    {
        return Notification::query()
            ->where('user_id', $user->id)
            ->with(['course:id,title', 'chapter:id,title'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function markAsRead(Notification $notification, User $user): bool
    {
        if ($notification->user_id !== $user->id) {
            throw new AuthorizationException('You are not authorized to mark this notification as read.', 403);
        }

        $result = DB::table('notifications')
            ->where('id', $notification->id)
            ->where('user_id', $user->id)
            ->update(['is_read' => true]);

        $this->cache->forget($this->cache->getNotificationCountKey($user->id));

        return $result > 0;
    }

    public function getUnreadCount(User $user): int
    {
        return $this->cache->remember(
            $this->cache->getNotificationCountKey($user->id),
            CacheService::NOTIFICATION_COUNT_TTL,
            fn () => Notification::query()
                ->where('user_id', $user->id)
                ->where('is_read', false)
                ->count()
        );
    }
}
