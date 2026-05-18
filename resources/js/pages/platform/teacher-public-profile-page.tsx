import { ArrowLeft, BookOpen, Mail, ShoppingBag, UserCircle2 } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/platform/empty-state';
import api from '@/lib/api';
import { assetUrl } from '@/lib/utils';
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
        <div className="space-y-5">
            <Link to="/dashboard/student?tab=catalog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/50 transition-colors hover:text-black">
                <ArrowLeft className="size-3.5" />
                Back to catalog
            </Link>

            {loading ? (
                <p className="text-sm text-black/45">Loading teacher profile...</p>
            ) : error ? (
                <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-5 text-xs text-red-600">{error}</div>
            ) : !data ? (
                <EmptyState title="Teacher not found" description="This teacher profile is unavailable right now." />
            ) : (
                <section className="grid gap-5 xl:grid-cols-[0.78fr,1.22fr]">
                    <div className="brand-surface-dark p-6 text-white">
                        <div className="flex flex-col items-center text-center">
                            {assetUrl(data.teacher.avatar_path) ? (
                                <img
                                    src={assetUrl(data.teacher.avatar_path) ?? undefined}
                                    alt={data.teacher.name}
                                    className="size-24 rounded-[1.5rem] object-cover shadow-lg ring-2 ring-white/20"
                                />
                            ) : (
                                <div className="flex size-24 items-center justify-center rounded-[1.5rem] bg-white/10 ring-2 ring-white/10">
                                    <UserCircle2 className="size-12" />
                                </div>
                            )}
                            <h1 className="mt-4 text-2xl font-black">{data.teacher.name}</h1>
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white/70">
                                <Mail className="size-3" />
                                {data.teacher.email}
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-white/65">
                                {data.teacher.bio || 'This teacher has not added a bio yet.'}
                            </p>
                        </div>
                    </div>

                    <div className="brand-surface p-6">
                        <p className="brand-kicker">Teacher catalog</p>
                        <h2 className="mt-2 brand-section-title text-2xl">Courses by {data.teacher.name}</h2>
                        <p className="mt-1.5 text-sm text-black/55">
                            Browse this teacher's courses, review pricing and ratings, and decide what you want to unlock next.
                        </p>

                        {data.courses.length === 0 ? (
                            <div className="mt-5">
                                <EmptyState title="No courses yet" description="This teacher has not published any courses yet." />
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                {data.courses.map((course) => (
                                    <article key={course.id} className="brand-surface-soft p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-base font-black text-black">{course.title}</p>
                                                <p className="mt-1.5 text-xs leading-relaxed text-black/55 line-clamp-2">{course.description}</p>
                                            </div>
                                            <BookOpen className="size-4 shrink-0 text-[#2563eb]" />
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            <span className="brand-tag-yellow">${Number(course.price).toFixed(2)}</span>
                                            <span className="brand-tag-blue">{course.chapters_count ?? 0} chapters</span>
                                            <span className="brand-tag-red">
                                                {course.ratings_avg_rating ? `${Number(course.ratings_avg_rating).toFixed(1)} stars` : 'No rating'}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" size="sm" className="rounded-[0.8rem] text-[11px]" onClick={() => void toggleWishlist(course)}>
                                                {course.is_wishlisted ? 'Remove' : 'Add wishlist'}
                                            </Button>

                                            {course.is_purchased ? (
                                                <div className="rounded-[0.8rem] bg-[#edf4ff] px-3 py-1.5 text-[11px] font-medium text-[#2563eb]">
                                                    Code: {course.enrollment_code}
                                                </div>
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
