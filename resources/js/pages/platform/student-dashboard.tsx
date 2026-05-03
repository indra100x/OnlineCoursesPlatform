import { type FormEvent, useEffect, useEffectEvent, useState } from 'react';
import { Bell, BookOpen, CheckCheck, GraduationCap } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { StatsCard } from '@/components/platform/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlatformNotification, StudentCourse } from '@/types/platform';

type StudentDashboardProps = {
    onUnreadCountChange: (count: number) => void;
};

export default function StudentDashboard({ onUnreadCountChange }: StudentDashboardProps) {
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
    const [enrollmentCode, setEnrollmentCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') === 'notifications' ? 'notifications' : 'courses';

    const loadCourses = useEffectEvent(async () => {
        try {
            const response = await api.get<{ courses: StudentCourse[] }>('/my-courses');
            setCourses(response.data.courses);
        } catch {
            setError('Unable to load your courses right now.');
        }
    });

    const loadNotifications = useEffectEvent(async () => {
        try {
            const response = await api.get<{ notifications: PlatformNotification[] }>('/notifications');
            setNotifications(response.data.notifications);
            onUnreadCountChange(
                response.data.notifications.filter((item: PlatformNotification) => !item.is_read).length,
            );
        } catch {
            setError('Unable to load notifications right now.');
        }
    });

    useEffect(() => {
        void loadCourses();
        void loadNotifications();
    }, []);

    async function handleEnroll(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            await api.post('/enroll', { enrollment_code: enrollmentCode });
            setEnrollmentCode('');
            await loadCourses();
            await loadNotifications();
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

    const unreadCount = notifications.filter((item) => !item.is_read).length;

    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                <StatsCard label="My Courses" value={courses.length} hint="Courses you've joined with enrollment codes." />
                <StatsCard label="Unread Alerts" value={unreadCount} hint="Chapter notifications waiting for your attention." />
                <StatsCard
                    label="Course Chapters"
                    value={courses.reduce((total, course) => total + (course.chapters_count ?? 0), 0)}
                    hint="Total chapters available across your enrolled courses."
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[360px,1fr]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="size-5 text-sky-700" />
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">Join a course</h2>
                                <p className="text-sm text-slate-600">Paste the teacher's enrollment code to get access.</p>
                            </div>
                        </div>

                        <form className="mt-6 space-y-4" onSubmit={handleEnroll}>
                            <div className="space-y-2">
                                <Label htmlFor="enrollment-code">Enrollment code</Label>
                                <Input
                                    id="enrollment-code"
                                    value={enrollmentCode}
                                    onChange={(event) => setEnrollmentCode(event.target.value.toUpperCase())}
                                    placeholder="ABC123XYZ9"
                                    required
                                />
                            </div>
                            {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            <Button type="submit" className="rounded-2xl">
                                Enroll now
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                        <div className="flex gap-3">
                            <Link
                                to="/dashboard/student"
                                className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'courses' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                Courses
                            </Link>
                            <Link
                                to="/dashboard/student?tab=notifications"
                                className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'notifications' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}
                            >
                                Notifications
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                    {activeTab === 'courses' ? (
                        <>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">My learning space</h2>
                                <p className="text-sm text-slate-600">Open any course to read chapters and follow updates.</p>
                            </div>
                            <div className="mt-6 space-y-4">
                                {courses.length === 0 ? (
                                    <EmptyState title="No enrolled courses" description="Use an enrollment code to join your first course." />
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
                                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
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
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                <Bell className="size-5 text-sky-700" />
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-950">Notifications</h2>
                                    <p className="text-sm text-slate-600">Stay on top of every new chapter release.</p>
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
                                                notification.is_read
                                                    ? 'border-slate-200 bg-slate-50/70'
                                                    : 'border-amber-300 bg-amber-50'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{notification.message}</p>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {notification.course?.title ?? 'Course update'}
                                                    </p>
                                                </div>
                                                {!notification.is_read ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="rounded-2xl bg-white"
                                                        onClick={() => void markAsRead(notification.id)}
                                                    >
                                                        <CheckCheck className="size-4" />
                                                        Mark as read
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
