import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/platform/empty-state';
import { Button } from '@/components/ui/button';
import type { PlatformNotification } from '@/types/platform';

type NotificationsTabProps = {
    notifications: PlatformNotification[];
    onMarkAsRead: (id: number) => void;
};

export function NotificationsTab({
    notifications,
    onMarkAsRead,
}: NotificationsTabProps) {
    return (
        <>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-[#2563eb] text-white">
                    <Bell className="size-4" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-black">
                        Notifications
                    </h2>
                    <p className="text-xs text-black/50">
                        Stay on top of fresh chapter releases and activity.
                    </p>
                </div>
            </div>
            <div className="mt-4 space-y-3">
                {notifications.length === 0 ? (
                    <EmptyState
                        title="No notifications yet"
                        description="You'll see new chapter alerts here as teachers publish them."
                    />
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`rounded-[1.25rem] border p-4 ${
                                notification.is_read
                                    ? 'border-black/8 bg-[#fffdf7]'
                                    : 'border-[#2563eb]/20 bg-[#edf4ff]'
                            }`}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-black">
                                        {notification.message}
                                    </p>
                                    <p className="mt-0.5 text-xs text-black/50">
                                        {notification.course?.title ??
                                            'Course update'}
                                    </p>
                                </div>
                                {!notification.is_read ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 rounded-[0.8rem] text-[11px]"
                                        onClick={() =>
                                            void onMarkAsRead(notification.id)
                                        }
                                    >
                                        Mark as read
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
