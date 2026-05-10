import { type FormEvent, useEffect, useEffectEvent, useState } from 'react';
import { Bell, BookHeart, BookOpen, CreditCard, GraduationCap, Heart, ShoppingBag, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { StatsCard } from '@/components/platform/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Course, PlatformNotification, StudentCourse } from '@/types/platform';

type StudentDashboardProps = {
    onUnreadCountChange: (count: number) => void;
};

export default function StudentDashboard({ onUnreadCountChange }: StudentDashboardProps) {
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [catalog, setCatalog] = useState<Course[]>([]);
    const [wishlist, setWishlist] = useState<Course[]>([]);
    const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
    const [enrollmentCode, setEnrollmentCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') ?? 'courses';

    const loadCourses = useEffectEvent(async () => {
        try {
            const response = await api.get<{ courses: StudentCourse[] }>('/my-courses');
            setCourses(response.data.courses);
        } catch {
            setError('Unable to load your courses right now.');
        }
    });

    const loadCatalog = useEffectEvent(async () => {
        try {
            const response = await api.get<{ courses: Course[] }>('/catalog');
            setCatalog(response.data.courses);
        } catch {
            setError('Unable to load the catalog right now.');
        }
    });

    const loadWishlist = useEffectEvent(async () => {
        try {
            const response = await api.get<{ courses: Course[] }>('/wishlist');
            setWishlist(response.data.courses);
        } catch {
            setWishlist([]);
        }
    });

    const loadNotifications = useEffectEvent(async () => {
        try {
            const response = await api.get<{ notifications: PlatformNotification[] }>('/notifications');
            setNotifications(response.data.notifications);
            onUnreadCountChange(response.data.notifications.filter((item) => !item.is_read).length);
        } catch {
            setError('Unable to load notifications right now.');
        }
    });

    async function refreshStudentData() {
        await Promise.all([loadCourses(), loadCatalog(), loadWishlist(), loadNotifications()]);
    }

    useEffect(() => {
        void refreshStudentData();
    }, []);

    async function handleEnroll(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            await api.post('/enroll', { enrollment_code: enrollmentCode });
            setEnrollmentCode('');
            await refreshStudentData();
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Enrollment failed.');
        }
    }

    async function markAsRead(notificationId: number) {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            await loadNotifications();
        } catch {
            setError('Unable to mark this notification as read.');
        }
    }

    async function handlePurchase(courseId: number) {
        try {
            await api.post(`/courses/${courseId}/purchase`);
            await refreshStudentData();
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to complete the beta purchase.');
        }
    }

    async function toggleWishlist(course: Course) {
        try {
            if (course.is_wishlisted) {
                await api.delete(`/wishlist/${course.id}`);
            } else {
                await api.post('/wishlist', { course_id: course.id });
            }

            await Promise.all([loadCatalog(), loadWishlist()]);
        } catch {
            setError('Unable to update the wishlist right now.');
        }
    }

    async function enrollWithUnlockedCode(course: Course) {
        if (!course.enrollment_code) {
            return;
        }

        setEnrollmentCode(course.enrollment_code);

        try {
            await api.post('/enroll', { enrollment_code: course.enrollment_code });
            await refreshStudentData();
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Enrollment failed.');
        }
    }

    const unreadCount = notifications.filter((item) => !item.is_read).length;
    const purchasedCount = catalog.filter((course) => course.is_purchased).length;

    return (
        <div className="space-y-6">
            <section className="grid gap-5 xl:grid-cols-[1.08fr,0.92fr]">
                <div className="brand-surface-dark relative overflow-hidden p-7">
                    <div className="absolute -left-8 top-12 h-24 w-24 rounded-full bg-[#ffd84d]" />
                    <div className="absolute right-6 top-0 h-20 w-20 rounded-b-[1.8rem] bg-[#2563eb]" />
                    <div className="relative z-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Student experience</p>
                        <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">Buy, unlock, enroll, and keep momentum.</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
                            The flow stays simple for learners, but the presentation feels richer, brighter, and more premium at every step.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-3">
                    <div className="brand-surface-soft p-5">
                        <p className="brand-kicker">Current tab</p>
                        <p className="mt-3 text-2xl font-black capitalize text-black">{activeTab}</p>
                    </div>
                    <div className="rounded-[2rem] bg-[#ffd84d] p-5 text-black shadow-[0_18px_44px_rgba(255,216,77,0.18)]">
                        <p className="brand-kicker text-black/55">Unlocked purchases</p>
                        <p className="mt-3 text-2xl font-black">{purchasedCount}</p>
                    </div>
                    <div className="brand-surface-soft p-5">
                        <p className="brand-kicker">Unread</p>
                        <p className="mt-3 text-2xl font-black text-black">{unreadCount}</p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
                <StatsCard label="My Courses" value={courses.length} hint="Courses you already unlocked and joined." />
                <StatsCard label="Purchases" value={purchasedCount} hint="Beta purchases that revealed an enrollment code." />
                <StatsCard label="Wishlist" value={wishlist.length} hint="Courses you saved for later." />
                <StatsCard label="Unread Alerts" value={unreadCount} hint="Fresh updates from teachers and new chapter drops." />
            </section>

            <section className="grid gap-6 xl:grid-cols-[360px,1fr]">
                <div className="space-y-6">
                    <div className="brand-surface p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                                <GraduationCap className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-black">Join with unlocked code</h2>
                                <p className="text-sm text-black/60">Beta purchase first, then use the revealed code to activate the course.</p>
                            </div>
                        </div>

                        <form className="mt-6 space-y-4" onSubmit={handleEnroll}>
                            <div className="space-y-2">
                                <Label htmlFor="enrollment-code">Enrollment code</Label>
                                <Input
                                    id="enrollment-code"
                                    value={enrollmentCode}
                                    onChange={(event) => setEnrollmentCode(event.target.value.toUpperCase())}
                                    placeholder="Unlock code from a beta purchase"
                                    required
                                />
                            </div>
                            {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
                            <Button type="submit" className="rounded-2xl bg-black text-white hover:bg-black/90">
                                Enroll now
                            </Button>
                        </form>
                    </div>

                    <div className="brand-surface p-6">
                        <div className="flex flex-wrap gap-3">
                            {[
                                ['courses', 'My Courses'],
                                ['catalog', 'Catalog'],
                                ['wishlist', 'Wishlist'],
                                ['notifications', 'Notifications'],
                            ].map(([value, label]) => (
                                <Link
                                    key={value}
                                    to={`/dashboard/student?tab=${value}`}
                                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                                        activeTab === value ? 'bg-black text-white' : 'border border-black/10 bg-white text-black hover:border-[#2563eb] hover:bg-[#edf4ff]'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="brand-surface p-6">
                    {activeTab === 'courses' ? (
                        <>
                            <div>
                                <h2 className="text-xl font-semibold text-black">My learning space</h2>
                                <p className="text-sm text-black/60">Open any enrolled course to review chapters and leave a rating.</p>
                            </div>
                            <div className="mt-6 space-y-4">
                                {courses.length === 0 ? (
                                    <EmptyState title="No enrolled courses" description="Buy a course in beta, unlock the code, then enroll here." />
                                ) : (
                                    courses.map((course) => (
                                        <Link
                                            key={course.id}
                                            to={`/dashboard/courses/${course.id}`}
                                            className="block rounded-3xl border border-black/10 bg-[#fffdf7] p-5 transition hover:border-[#2563eb] hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)]"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-black">{course.title}</p>
                                                    <p className="mt-1 text-sm text-black/60">{course.description}</p>
                                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                                                        Teacher {course.teacher.name}
                                                    </p>
                                                </div>
                                                <BookOpen className="size-5 text-[#ef4444]" />
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </>
                    ) : null}

                    {activeTab === 'catalog' ? (
                        <>
                            <div>
                                <h2 className="text-xl font-semibold text-black">Course catalog</h2>
                                <p className="text-sm text-black/60">Save favorites, beta-buy courses, and unlock enrollment codes.</p>
                            </div>
                            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                {catalog.map((course) => (
                                    <div key={course.id} className="rounded-3xl border border-black/10 bg-[#fffdf7] p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-black">{course.title}</p>
                                                <p className="mt-1 text-sm text-black/60">{course.description}</p>
                                                {course.teacher ? (
                                                    <Link
                                                        to={`/dashboard/teachers/${course.teacher.id}`}
                                                        className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb] transition hover:text-black"
                                                    >
                                                        Teacher {course.teacher.name}
                                                    </Link>
                                                ) : null}
                                            </div>
                                            <button type="button" onClick={() => void toggleWishlist(course)} className="text-rose-500">
                                                <Heart className={`size-5 ${course.is_wishlisted ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-black/65">
                                            <span className="rounded-full bg-[#ffd84d] px-3 py-1 font-medium text-black">
                                                ${Number(course.price).toFixed(2)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="size-4 text-[#ef4444]" />
                                                {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'No rating yet'}
                                            </span>
                                        </div>
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            {course.is_purchased ? (
                                                <>
                                                    <div className="rounded-2xl bg-[#edf4ff] px-4 py-2 text-sm font-medium text-[#2563eb]">
                                                        Code unlocked: {course.enrollment_code}
                                                    </div>
                                                    {!course.is_enrolled ? (
                                                        <Button
                                                            type="button"
                                                            className="rounded-2xl bg-black text-white hover:bg-black/90"
                                                            onClick={() => void enrollWithUnlockedCode(course)}
                                                        >
                                                            Use code and enroll
                                                        </Button>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    className="rounded-2xl bg-[#ffd84d] text-black hover:bg-[#facc15]"
                                                    onClick={() => void handlePurchase(course.id)}
                                                >
                                                    <ShoppingBag className="size-4" />
                                                    Beta buy
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}

                    {activeTab === 'wishlist' ? (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef4444] text-white">
                                    <BookHeart className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-black">Wishlist</h2>
                                    <p className="text-sm text-black/60">Your saved courses waiting for a future beta purchase.</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {wishlist.length === 0 ? (
                                    <EmptyState title="Wishlist is empty" description="Save courses from the catalog to keep track of what you want next." />
                                ) : (
                                    wishlist.map((course) => (
                                    <div key={course.id} className="rounded-3xl border border-black/10 bg-[#fffdf7] p-5">
                                                <p className="font-semibold text-black">{course.title}</p>
                                                <p className="mt-1 text-sm text-black/60">{course.description}</p>
                                            <div className="mt-4 flex gap-3">
                                                <Button
                                                    type="button"
                                                    className="rounded-2xl bg-[#ffd84d] text-black hover:bg-[#facc15]"
                                                    onClick={() => void handlePurchase(course.id)}
                                                >
                                                    <CreditCard className="size-4" />
                                                    Beta buy
                                                </Button>
                                                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => void toggleWishlist({ ...course, is_wishlisted: true })}>
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : null}

                    {activeTab === 'notifications' ? (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563eb] text-white">
                                    <Bell className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-black">Notifications</h2>
                                    <p className="text-sm text-black/60">Stay on top of fresh chapter releases and activity.</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {notifications.length === 0 ? (
                                    <EmptyState title="No notifications yet" description="You'll see new chapter alerts here as teachers publish them." />
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`rounded-3xl border p-5 ${
                                                notification.is_read ? 'border-black/10 bg-[#fffdf7]' : 'border-[#2563eb]/20 bg-[#edf4ff]'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                    <p className="font-semibold text-black">{notification.message}</p>
                                                    <p className="mt-1 text-sm text-black/60">{notification.course?.title ?? 'Course update'}</p>
                                                </div>
                                                {!notification.is_read ? (
                                                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => void markAsRead(notification.id)}>
                                                        Mark as read
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
