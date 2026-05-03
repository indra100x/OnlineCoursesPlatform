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
            <section className="grid gap-4 md:grid-cols-4">
                <StatsCard label="My Courses" value={courses.length} hint="Courses you already unlocked and joined." />
                <StatsCard label="Purchases" value={purchasedCount} hint="Beta purchases that revealed an enrollment code." />
                <StatsCard label="Wishlist" value={wishlist.length} hint="Courses you saved for later." />
                <StatsCard label="Unread Alerts" value={unreadCount} hint="Fresh updates from teachers and new chapter drops." />
            </section>

            <section className="grid gap-6 xl:grid-cols-[360px,1fr]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="size-5 text-fuchsia-700" />
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">Join with unlocked code</h2>
                                <p className="text-sm text-slate-600">Beta purchase first, then use the revealed code to activate the course.</p>
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
                            {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            <Button type="submit" className="rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-700">
                                Enroll now
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
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
                                        activeTab === value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                    {activeTab === 'courses' ? (
                        <>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">My learning space</h2>
                                <p className="text-sm text-slate-600">Open any enrolled course to read PDF chapters and leave a rating.</p>
                            </div>
                            <div className="mt-6 space-y-4">
                                {courses.length === 0 ? (
                                    <EmptyState title="No enrolled courses" description="Buy a course in beta, unlock the code, then enroll here." />
                                ) : (
                                    courses.map((course) => (
                                        <Link
                                            key={course.id}
                                            to={`/dashboard/courses/${course.id}`}
                                            className="block rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition hover:bg-slate-100"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{course.title}</p>
                                                    <p className="mt-1 text-sm text-slate-600">{course.description}</p>
                                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-700">
                                                        Teacher {course.teacher.name}
                                                    </p>
                                                </div>
                                                <BookOpen className="size-5 text-slate-700" />
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
                                <h2 className="text-xl font-semibold text-slate-950">Course catalog</h2>
                                <p className="text-sm text-slate-600">Save favorites, beta-buy courses, and unlock enrollment codes.</p>
                            </div>
                            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                {catalog.map((course) => (
                                    <div key={course.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">{course.title}</p>
                                                <p className="mt-1 text-sm text-slate-600">{course.description}</p>
                                            </div>
                                            <button type="button" onClick={() => void toggleWishlist(course)} className="text-rose-500">
                                                <Heart className={`size-5 ${course.is_wishlisted ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                                            <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-900">
                                                ${Number(course.price).toFixed(2)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="size-4 text-amber-500" />
                                                {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'No rating yet'}
                                            </span>
                                        </div>
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            {course.is_purchased ? (
                                                <>
                                                    <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
                                                        Code unlocked: {course.enrollment_code}
                                                    </div>
                                                    {!course.is_enrolled ? (
                                                        <Button
                                                            type="button"
                                                            className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                                                            onClick={() => void enrollWithUnlockedCode(course)}
                                                        >
                                                            Use code and enroll
                                                        </Button>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    className="rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
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
                                <BookHeart className="size-5 text-rose-600" />
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-950">Wishlist</h2>
                                    <p className="text-sm text-slate-600">Your saved courses waiting for a future beta purchase.</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {wishlist.length === 0 ? (
                                    <EmptyState title="Wishlist is empty" description="Save courses from the catalog to keep track of what you want next." />
                                ) : (
                                    wishlist.map((course) => (
                                        <div key={course.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                                            <p className="font-semibold text-slate-900">{course.title}</p>
                                            <p className="mt-1 text-sm text-slate-600">{course.description}</p>
                                            <div className="mt-4 flex gap-3">
                                                <Button
                                                    type="button"
                                                    className="rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
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
                                <Bell className="size-5 text-fuchsia-700" />
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-950">Notifications</h2>
                                    <p className="text-sm text-slate-600">Stay on top of fresh PDF chapter releases and activity.</p>
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
                                                notification.is_read ? 'border-slate-200 bg-slate-50/70' : 'border-fuchsia-200 bg-fuchsia-50'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{notification.message}</p>
                                                    <p className="mt-1 text-sm text-slate-600">{notification.course?.title ?? 'Course update'}</p>
                                                </div>
                                                {!notification.is_read ? (
                                                    <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={() => void markAsRead(notification.id)}>
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
