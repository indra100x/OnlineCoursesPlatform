import { GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ErrorMessage } from '@/components/platform/error-message';
import { StatsCard } from '@/components/platform/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudentData } from '@/hooks/use-student-data';
import { CatalogTab } from './components/catalog-tab';
import { MyCoursesTab } from './components/my-courses-tab';
import { NotificationsTab } from './components/notifications-tab';
import { WishlistTab } from './components/wishlist-tab';

type StudentDashboardProps = {
    onUnreadCountChange: (count: number) => void;
};

const TABS = [
    { key: 'courses', label: 'My Courses' },
    { key: 'catalog', label: 'Catalog' },
    { key: 'wishlist', label: 'Wishlist' },
    { key: 'notifications', label: 'Notifications' },
] as const;

export default function StudentDashboard({
    onUnreadCountChange,
}: StudentDashboardProps) {
    const [enrollmentCode, setEnrollmentCode] = useState('');
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') ?? 'courses';

    const {
        courses,
        catalog,
        catalogMeta,
        wishlist,
        notifications,
        error,
        setError,
        handlePurchase,
        toggleWishlist,
        enrollWithCode,
        markAsRead,
        loadNotifications,
        goToCatalogPage,
    } = useStudentData(
        activeTab as 'courses' | 'catalog' | 'wishlist' | 'notifications',
        {
            onUnreadCountChange,
        },
    );

    const handleUnreadCount = useCallback(async () => {
        const items = await loadNotifications();
        onUnreadCountChange(
            items.filter((item: { is_read: boolean }) => !item.is_read).length,
        );
    }, [loadNotifications, onUnreadCountChange]);

    useEffect(() => {
        if (activeTab === 'notifications') {
            void handleUnreadCount();
        }
    }, [activeTab, handleUnreadCount]);

    async function handleEnroll(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        await enrollWithCode(enrollmentCode);
        setEnrollmentCode('');
    }

    const unreadCount = notifications.filter((item) => !item.is_read).length;
    const purchasedCount = catalog.filter(
        (course) => course.is_purchased,
    ).length;

    return (
        <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-4">
                <StatsCard
                    label="My Courses"
                    value={courses.length}
                    hint="Enrolled and learning"
                />
                <StatsCard
                    label="Purchases"
                    value={purchasedCount}
                    hint="Beta buy completions"
                />
                <StatsCard
                    label="Wishlist"
                    value={wishlist.length}
                    hint="Saved for later"
                    variant="blue"
                />
                <StatsCard
                    label="Unread"
                    value={unreadCount}
                    hint="Fresh notifications"
                    variant="accent"
                />
            </section>

            <section className="grid gap-5 xl:grid-cols-[360px,1fr]">
                <div className="space-y-5">
                    <div className="brand-surface p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-black text-white">
                                <GraduationCap className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-black">
                                    Join with code
                                </h2>
                                <p className="text-xs text-black/50">
                                    Use an enrollment code to activate a course.
                                </p>
                            </div>
                        </div>

                        <form
                            className="mt-4 space-y-3.5"
                            onSubmit={handleEnroll}
                        >
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="enrollment-code"
                                    className="text-xs font-semibold"
                                >
                                    Enrollment code
                                </Label>
                                <Input
                                    id="enrollment-code"
                                    value={enrollmentCode}
                                    onChange={(event) =>
                                        setEnrollmentCode(
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Unlock code from a beta purchase"
                                    required
                                />
                            </div>
                            {error ? <ErrorMessage message={error} /> : null}
                            <Button
                                type="submit"
                                className="rounded-xl bg-black text-white hover:bg-black/90"
                            >
                                Enroll now
                            </Button>
                        </form>
                    </div>

                    <div className="brand-surface p-4">
                        <div className="flex flex-wrap gap-1.5">
                            {TABS.map(({ key, label }) => (
                                <Link
                                    key={key}
                                    to={`/dashboard/student?tab=${key}`}
                                    className={`rounded-[0.8rem] px-3.5 py-1.5 text-xs font-medium transition-all ${
                                        activeTab === key
                                            ? 'bg-black text-white shadow-sm'
                                            : 'border border-black/8 bg-white text-black/60 hover:border-black/20 hover:text-black'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="brand-surface p-5">
                    {activeTab === 'courses' && (
                        <MyCoursesTab courses={courses} />
                    )}
                    {activeTab === 'catalog' && (
                        <CatalogTab
                            catalog={catalog}
                            pagination={catalogMeta}
                            onPageChange={goToCatalogPage}
                            onPurchase={handlePurchase}
                            onToggleWishlist={toggleWishlist}
                            onEnroll={enrollWithCode}
                        />
                    )}
                    {activeTab === 'wishlist' && (
                        <WishlistTab
                            wishlist={wishlist}
                            onPurchase={handlePurchase}
                            onToggleWishlist={toggleWishlist}
                        />
                    )}
                    {activeTab === 'notifications' && (
                        <NotificationsTab
                            notifications={notifications}
                            onMarkAsRead={markAsRead}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
