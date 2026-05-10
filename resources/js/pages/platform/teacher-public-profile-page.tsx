import { ArrowLeft, BookOpen, Mail, ShoppingBag, UserCircle2 } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/platform/empty-state';
import api from '@/lib/api';
import type { Course, TeacherProfileView } from '@/types/platform';

export default function TeacherPublicProfilePage() {
    const { teacherId } = useParams();
    const [data, setData] = useState<TeacherProfileView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTeacher = useEffectEvent(async () => {
        if (!teacherId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get<TeacherProfileView>(`/teachers/${teacherId}/profile`);
            setData(response.data);
        } catch {
            setError('Unable to load this teacher profile right now.');
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadTeacher();
    }, [teacherId]);

    async function handlePurchase(courseId: number) {
        try {
            await api.post(`/courses/${courseId}/purchase`);
            await loadTeacher();
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

            await loadTeacher();
        } catch {
            setError('Unable to update the wishlist right now.');
        }
    }

    return (
        <div className="space-y-6">
            <Link to="/dashboard/student?tab=catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-black/65 transition-colors hover:text-black">
                <ArrowLeft className="size-4" />
                Back to catalog
            </Link>

            {loading ? (
                <p className="text-sm text-black/55">Loading teacher profile...</p>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>
            ) : !data ? (
                <EmptyState title="Teacher not found" description="This teacher profile is unavailable right now." />
            ) : (
                <section className="grid gap-6 xl:grid-cols-[0.78fr,1.22fr]">
                    <div className="brand-surface-dark relative overflow-hidden p-7 text-white">
                        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-[#ffd84d]" />
                        <div className="absolute right-6 top-0 h-20 w-20 rounded-b-[1.8rem] bg-[#2563eb]" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            {data.teacher.avatar_path ? (
                                <img
                                    src={`/storage/${data.teacher.avatar_path}`}
                                    alt={data.teacher.name}
                                    className="size-28 rounded-[2rem] object-cover shadow-2xl"
                                />
                            ) : (
                                <div className="flex size-28 items-center justify-center rounded-[2rem] bg-white/10">
                                    <UserCircle2 className="size-14" />
                                </div>
                            )}
                            <h1 className="mt-5 text-3xl font-black">{data.teacher.name}</h1>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/75">
                                <Mail className="size-4" />
                                {data.teacher.email}
                            </div>
                            <p className="mt-5 text-sm leading-7 text-white/72">
                                {data.teacher.bio || 'This teacher has not added a bio yet.'}
                            </p>
                        </div>
                    </div>

                    <div className="brand-surface p-7">
                        <p className="brand-kicker">Teacher catalog</p>
                        <h2 className="mt-3 brand-section-title">Other courses by {data.teacher.name}</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
                            Browse this teacher's other courses, review pricing and ratings, and decide what you want to unlock next.
                        </p>

                        {data.courses.length === 0 ? (
                            <div className="mt-6">
                                <EmptyState title="No courses yet" description="This teacher has not published any courses yet." />
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                {data.courses.map((course) => (
                                    <article key={course.id} className="brand-surface-soft p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-lg font-black text-black">{course.title}</p>
                                                <p className="mt-2 text-sm leading-6 text-black/60">{course.description}</p>
                                            </div>
                                            <BookOpen className="size-5 text-[#2563eb]" />
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <span className="brand-tag-yellow">${Number(course.price).toFixed(2)}</span>
                                            <span className="brand-tag-blue">{course.chapters_count ?? 0} chapters</span>
                                            <span className="brand-tag-red">
                                                {course.ratings_avg_rating ? `${Number(course.ratings_avg_rating).toFixed(1)} stars` : 'No rating'}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <Button type="button" variant="outline" className="rounded-2xl" onClick={() => void toggleWishlist(course)}>
                                                {course.is_wishlisted ? 'Remove wishlist' : 'Add wishlist'}
                                            </Button>

                                            {course.is_purchased ? (
                                                <div className="rounded-2xl bg-[#edf4ff] px-4 py-2 text-sm font-medium text-[#2563eb]">
                                                    Code unlocked: {course.enrollment_code}
                                                </div>
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
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
