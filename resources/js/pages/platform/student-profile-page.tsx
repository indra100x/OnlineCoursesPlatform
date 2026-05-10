import { ArrowLeft, BookOpen, Mail, Star, UserCircle2 } from 'lucide-react';
import { useEffect, useEffectEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/platform/empty-state';
import api from '@/lib/api';
import type { StudentProfileView } from '@/types/platform';

export default function StudentProfilePage() {
    const { studentId } = useParams();
    const [data, setData] = useState<StudentProfileView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStudent = useEffectEvent(async () => {
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
    });

    useEffect(() => {
        void loadStudent();
    }, [studentId]);

    return (
        <div className="space-y-6">
            <Link to="/dashboard/teacher" className="inline-flex items-center gap-2 text-sm font-semibold text-black/65 transition-colors hover:text-black">
                <ArrowLeft className="size-4" />
                Back to teacher dashboard
            </Link>

            {loading ? (
                <p className="text-sm text-black/55">Loading student profile...</p>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>
            ) : !data ? (
                <EmptyState title="Student not found" description="This student is unavailable or not enrolled in your courses." />
            ) : (
                <>
                    <section className="grid gap-6 xl:grid-cols-[0.75fr,1.25fr]">
                        <div className="brand-surface-dark relative overflow-hidden p-7 text-white">
                            <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-[#ffd84d]" />
                            <div className="absolute right-6 top-0 h-20 w-20 rounded-b-[1.8rem] bg-[#2563eb]" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                {data.student.avatar_path ? (
                                    <img
                                        src={`/storage/${data.student.avatar_path}`}
                                        alt={data.student.name}
                                        className="size-28 rounded-[2rem] object-cover shadow-2xl"
                                    />
                                ) : (
                                    <div className="flex size-28 items-center justify-center rounded-[2rem] bg-white/10">
                                        <UserCircle2 className="size-14" />
                                    </div>
                                )}
                                <h1 className="mt-5 text-3xl font-black">{data.student.name}</h1>
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/75">
                                    <Mail className="size-4" />
                                    {data.student.email}
                                </div>
                                <p className="mt-5 text-sm leading-7 text-white/72">
                                    {data.student.bio || 'This student has not added a bio yet.'}
                                </p>
                            </div>
                        </div>

                        <div className="brand-surface p-7">
                            <p className="brand-kicker">Shared learning footprint</p>
                            <h2 className="mt-3 brand-section-title">Courses this student takes with you</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/62">
                                See every course this learner joined under your teaching workspace, including pricing, rating activity, and volume.
                            </p>

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
                                            <span className="brand-tag-red">{course.enrollments_count ?? 0} students</span>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between text-sm text-black/60">
                                            <span>Code: {course.enrollment_code}</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="size-4 text-[#ef4444]" />
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
