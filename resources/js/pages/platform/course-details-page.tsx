import { useEffect, useEffectEvent, useState } from 'react';
import { ArrowLeft, BookMarked, Film, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import type { StudentCourse } from '@/types/platform';

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<StudentCourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCourse = useEffectEvent(async () => {
        if (!courseId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get<{ course: StudentCourse }>(`/courses/${courseId}/chapters`);
            setCourse(response.data.course);
        } catch {
            setError('Unable to load this course right now.');
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadCourse();
    }, [courseId]);

    return (
        <div className="space-y-6">
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <ArrowLeft className="size-4" />
                Back to student dashboard
            </Link>

            {loading ? (
                <p className="text-sm text-slate-600">Loading course chapters...</p>
            ) : error ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
            ) : !course ? (
                <EmptyState title="Course not found" description="This course is unavailable or you no longer have access." />
            ) : (
                <>
                    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                            Enrollment code {course.enrollment_code}
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{course.title}</h1>
                        <p className="mt-3 max-w-3xl text-sm text-slate-600">{course.description}</p>
                        <p className="mt-4 text-sm font-medium text-slate-700">Teacher: {course.teacher.name}</p>
                    </section>

                    <section className="space-y-4">
                        {!course.chapters || course.chapters.length === 0 ? (
                            <EmptyState title="No chapters yet" description="Your teacher has not published any chapter content yet." />
                        ) : (
                            course.chapters.map((chapter) => (
                                <article
                                    key={chapter.id}
                                    className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                            {chapter.content_type === 'video' ? (
                                                <Film className="size-5" />
                                            ) : chapter.content_type === 'file' ? (
                                                <FileText className="size-5" />
                                            ) : (
                                                <BookMarked className="size-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                                                {chapter.content_type}
                                            </p>
                                            <h2 className="mt-1 text-xl font-semibold text-slate-950">{chapter.title}</h2>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                                        {chapter.content_type === 'text' ? (
                                            <p className="whitespace-pre-line">{chapter.content}</p>
                                        ) : null}

                                        {chapter.content_type === 'video' && chapter.video_url ? (
                                            <a
                                                href={chapter.video_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-medium text-sky-700 underline underline-offset-4"
                                            >
                                                Open lesson video
                                            </a>
                                        ) : null}

                                        {chapter.content_type === 'file' && chapter.file_path ? (
                                            <a
                                                href={`/storage/${chapter.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-medium text-sky-700 underline underline-offset-4"
                                            >
                                                Download {chapter.file_name ?? 'chapter file'}
                                            </a>
                                        ) : null}
                                    </div>
                                </article>
                            ))
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
