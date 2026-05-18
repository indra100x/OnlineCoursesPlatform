import { type FormEvent, useEffect, useEffectEvent, useState } from 'react';
import { Bell, BookHeart, BookOpen, CreditCard, GraduationCap, Heart, ShoppingBag, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Course, PlatformNotification, StudentCourse } from '@/types/platform';

type StudentDashboardProps = {
    onUnreadCountChange: (count: number) => void;
};

const TABS = [
    { key: 'courses', label: 'My Courses' },
    { key: 'catalog', label: 'Catalog' },
    { key: 'wishlist', label: 'Wishlist' },
    { key: 'notifications', label: 'Notifications' },
] as const;

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
        <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-4">
                <div className="brand-surface p-5">
                    <p className="brand-kicker">My Courses</p>
                    <p className="mt-2 text-3xl font-black text-black">{courses.length}</p>
                    <p className="mt-1 text-sm text-black/50">Enrolled and learning</p>
                </div>
                <div className="brand-surface p-5">
                    <p className="brand-kicker">Purchases</p>
                    <p className="mt-2 text-3xl font-black text-black">{purchasedCount}</p>
                    <p className="mt-1 text-sm text-black/50">Beta buy completions</p>
                </div>
                <div className="brand-surface-blue p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Wishlist</p>
                    <p className="mt-2 text-3xl font-black text-white">{wishlist.length}</p>
                    <p className="mt-1 text-sm text-white/65">Saved for later</p>
                </div>
                <div className="brand-surface-accent p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">Unread</p>
                    <p className="mt-2 text-3xl font-black text-black">{unreadCount}</p>
                    <p className="mt-1 text-sm text-black/55">Fresh notifications</p>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[360px,1fr]">
                <div className="space-y-5">
                    <div className="brand-surface p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-black text-white">
                                <GraduationCap className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-black">Join with code</h2>
                                <p className="text-xs text-black/50">Use an enrollment code to activate a course.</p>
                            </div>
                        </div>

                        <form className="mt-4 space-y-3.5" onSubmit={handleEnroll}>
                            <div className="space-y-1.5">
                                <Label htmlFor="enrollment-code" className="text-xs font-semibold">Enrollment code</Label>
                                <Input
                                    id="enrollment-code"
                                    value={enrollmentCode}
                                    onChange={(event) => setEnrollmentCode(event.target.value.toUpperCase())}
                                    placeholder="Unlock code from a beta purchase"
                                    required
                                />
                            </div>
                            {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}
                            <Button type="submit" className="rounded-xl bg-black text-white hover:bg-black/90">
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
                    {activeTab === 'courses' ? (
                        <>
                            <div>
                                <h2 className="text-base font-semibold text-black">My learning space</h2>
                                <p className="text-xs text-black/50">Open any enrolled course to review chapters and leave a rating.</p>
                            </div>
                            <div className="mt-4 space-y-3">
                                {courses.length === 0 ? (
                                    <EmptyState title="No enrolled courses" description="Buy a course in beta, unlock the code, then enroll here." />
                                ) : (
                                    courses.map((course) => (
                                        <Link
                                            key={course.id}
                                            to={`/dashboard/courses/${course.id}`}
                                            className="block rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4 transition hover:border-[#2563eb]/20 hover:shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-black">{course.title}</p>
                                                    <p className="mt-0.5 text-xs text-black/50 line-clamp-2">{course.description}</p>
                                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                                                        Teacher {course.teacher.name}
                                                    </p>
                                                </div>
                                                <BookOpen className="size-4 shrink-0 text-[#ef4444]" />
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
                                <h2 className="text-base font-semibold text-black">Course catalog</h2>
                                <p className="text-xs text-black/50">Save favorites, beta-buy courses, and unlock enrollment codes.</p>
                            </div>
                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                {catalog.map((course) => (
                                    <div key={course.id} className="rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-black truncate">{course.title}</p>
                                                <p className="mt-0.5 text-xs text-black/50 line-clamp-2">{course.description}</p>
                                                {course.teacher ? (
                                                    <Link
                                                        to={`/dashboard/teachers/${course.teacher.id}`}
                                                        className="mt-2 inline-flex text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563eb] transition hover:text-black"
                                                    >
                                                        Teacher {course.teacher.name}
                                                    </Link>
                                                ) : null}
                                            </div>
                                            <button type="button" onClick={() => void toggleWishlist(course)} className="text-rose-500 shrink-0">
                                                <Heart className={`size-4 ${course.is_wishlisted ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-black/60">
                                            <span className="rounded-full bg-[#ffd84d] px-2.5 py-0.5 font-medium text-black">
                                                ${Number(course.price).toFixed(2)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="size-3 text-[#ef4444]" />
                                                {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'No rating'}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {course.is_purchased ? (
                                                <>
                                                    <div className="rounded-[0.8rem] bg-[#edf4ff] px-3 py-1.5 text-[11px] font-medium text-[#2563eb]">
                                                        Code: {course.enrollment_code}
                                                    </div>
                                                    {!course.is_enrolled ? (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            className="rounded-[0.8rem] bg-black text-white hover:bg-black/90 text-[11px]"
                                                            onClick={() => void enrollWithUnlockedCode(course)}
                                                        >
                                                            Enroll now
                                                        </Button>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="rounded-[0.8rem] bg-[#ffd84d] text-black hover:bg-[#facc15] text-[11px]"
                                                    onClick={() => void handlePurchase(course.id)}
                                                >
                                                    <ShoppingBag className="size-3" />
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-[#ef4444] text-white">
                                    <BookHeart className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-black">Wishlist</h2>
                                    <p className="text-xs text-black/50">Your saved courses waiting for a future beta purchase.</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3">
                                {wishlist.length === 0 ? (
                                    <EmptyState title="Wishlist is empty" description="Save courses from the catalog to keep track of what you want next." />
                                ) : (
                                    wishlist.map((course) => (
                                        <div key={course.id} className="rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4">
                                            <p className="text-sm font-semibold text-black">{course.title}</p>
                                            <p className="mt-0.5 text-xs text-black/50 line-clamp-2">{course.description}</p>
                                            <div className="mt-3 flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="rounded-[0.8rem] bg-[#ffd84d] text-black hover:bg-[#facc15] text-[11px]"
                                                    onClick={() => void handlePurchase(course.id)}
                                                >
                                                    <CreditCard className="size-3" />
                                                    Beta buy
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" className="rounded-[0.8rem] text-[11px]" onClick={() => void toggleWishlist({ ...course, is_wishlisted: true })}>
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-[#2563eb] text-white">
                                    <Bell className="size-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-black">Notifications</h2>
                                    <p className="text-xs text-black/50">Stay on top of fresh chapter releases and activity.</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3">
                                {notifications.length === 0 ? (
                                    <EmptyState title="No notifications yet" description="You'll see new chapter alerts here as teachers publish them." />
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`rounded-[1.25rem] border p-4 ${
                                                notification.is_read ? 'border-black/8 bg-[#fffdf7]' : 'border-[#2563eb]/20 bg-[#edf4ff]'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-black">{notification.message}</p>
                                                    <p className="mt-0.5 text-xs text-black/50">{notification.course?.title ?? 'Course update'}</p>
                                                </div>
                                                {!notification.is_read ? (
                                                    <Button type="button" variant="outline" size="sm" className="rounded-[0.8rem] shrink-0 text-[11px]" onClick={() => void markAsRead(notification.id)}>
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
