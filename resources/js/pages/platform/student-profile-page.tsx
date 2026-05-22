import { ArrowLeft, BookOpen, Mail, Star, UserCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/platform/empty-state';
import api from '@/lib/api';
import { assetUrl } from '@/lib/utils';
import type { StudentProfileView } from '@/types/platform';

export default function StudentProfilePage() {
    const { studentId } = useParams();
    const [data, setData] = useState<StudentProfileView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStudent = async () => {
            if (!studentId) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await api.get<StudentProfileView>(`/students/${studentId}/profile`);
                setData(response.data);
            } catch {
                setError('Unable to load this student profile right now.');
            } finally {
                setLoading(false);
            }
        };

        void loadStudent();
    }, [studentId]);

    return (
        <div className="space-y-5">
            <Link to="/dashboard/teacher" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/50 transition-colors hover:text-black">
                <ArrowLeft className="size-3.5" />
                Back to teacher dashboard
            </Link>

            {loading ? (
                <p className="text-sm text-black/45">Loading student profile...</p>
            ) : error ? (
                <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-5 text-xs text-red-600">{error}</div>
            ) : !data ? (
                <EmptyState title="Student not found" description="This student is unavailable or not enrolled in your courses." />
            ) : (
                <>
                    <section className="grid gap-5 xl:grid-cols-[0.75fr,1.25fr]">
                        <div className="brand-surface-dark p-6 text-white">
                            <div className="flex flex-col items-center text-center">
                                {assetUrl(data.student.avatar_path) ? (
                                    <img
                                        src={assetUrl(data.student.avatar_path) ?? undefined}
                                        alt={data.student.name}
                                        className="size-24 rounded-[1.5rem] object-cover shadow-lg ring-2 ring-white/20"
                                    />
                                ) : (
                                    <div className="flex size-24 items-center justify-center rounded-[1.5rem] bg-white/10 ring-2 ring-white/10">
                                        <UserCircle2 className="size-12" />
                                    </div>
                                )}
                                <h1 className="mt-4 text-2xl font-black">{data.student.name}</h1>
                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white/70">
                                    <Mail className="size-3" />
                                    {data.student.email}
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-white/65">
                                    {data.student.bio || 'This student has not added a bio yet.'}
                                </p>
                            </div>
                        </div>

                        <div className="brand-surface p-6">
                            <p className="brand-kicker">Shared learning</p>
                            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-black">Courses this student takes with you</h2>
                            <p className="mt-1.5 text-sm text-black/55">
                                See every course this learner joined under your teaching workspace.
                            </p>

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
                                            <span className="brand-tag-red">{course.enrollments_count ?? 0} students</span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-xs text-black/55">
                                            <span>Code: {course.enrollment_code}</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="size-3 text-[#ef4444]" />
                                                {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'No rating'}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
