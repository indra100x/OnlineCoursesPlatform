import { type FormEvent, useEffect, useEffectEvent, useState } from 'react';
import { ArrowLeft, FileText, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CourseRating, StudentCourse } from '@/types/platform';

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<StudentCourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ratingForm, setRatingForm] = useState({ rating: '5', review: '' });

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

    async function handleRatingSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!courseId) {
            return;
        }

        try {
            await api.post(`/courses/${courseId}/ratings`, {
                rating: Number(ratingForm.rating),
                review: ratingForm.review,
            });
            await loadCourse();
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to save your rating.');
        }
    }

    return (
        <div className="space-y-6">
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-sm font-medium text-white">
                <ArrowLeft className="size-4" />
                Back to student dashboard
            </Link>

            {loading ? (
                <p className="text-sm text-white">Loading course chapters...</p>
            ) : error ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
            ) : !course ? (
                <EmptyState title="Course not found" description="This course is unavailable or you no longer have access." />
            ) : (
                <>
                    <section className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.85)] backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                            Enrollment code {course.enrollment_code}
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold">{course.title}</h1>
                        <p className="mt-3 max-w-3xl text-sm text-slate-100">{course.description}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                            <span>Teacher: {course.teacher.name}</span>
                            <span className="inline-flex items-center gap-1">
                                <Star className="size-4 text-amber-300" />
                                {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'No ratings yet'}
                            </span>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
                        <div className="space-y-4">
                            {!course.chapters || course.chapters.length === 0 ? (
                                <EmptyState title="No chapters yet" description="Your teacher has not published any PDF chapter content yet." />
                            ) : (
                                course.chapters.map((chapter) => (
                                    <article
                                        key={chapter.id}
                                        className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-600 text-white">
                                                <FileText className="size-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                                                    Chapter {chapter.position}
                                                </p>
                                                <h2 className="mt-1 text-xl font-semibold text-slate-950">{chapter.title}</h2>
                                            </div>
                                        </div>

                                        <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
                                            <a
                                                href={`/storage/${chapter.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-medium text-rose-700 underline underline-offset-4"
                                            >
                                                Open PDF: {chapter.file_name}
                                            </a>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                                <h2 className="text-xl font-semibold text-slate-950">Rate this course</h2>
                                <p className="mt-1 text-sm text-slate-600">Share a quick rating so the catalog feels more trustworthy and alive.</p>

                                <form className="mt-6 space-y-4" onSubmit={handleRatingSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="course-rating">Rating</Label>
                                        <Input
                                            id="course-rating"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={ratingForm.rating}
                                            onChange={(event) => setRatingForm((current) => ({ ...current, rating: event.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="course-review">Review</Label>
                                        <textarea
                                            id="course-review"
                                            className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                            value={ratingForm.review}
                                            onChange={(event) => setRatingForm((current) => ({ ...current, review: event.target.value }))}
                                            placeholder="What was strong? What could be better?"
                                        />
                                    </div>
                                    <Button type="submit" className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700">
                                        Save rating
                                    </Button>
                                </form>
                            </div>

                            <div className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                                <h2 className="text-xl font-semibold text-slate-950">Student feedback</h2>
                                <div className="mt-5 space-y-4">
                                    {!course.ratings || course.ratings.length === 0 ? (
                                        <EmptyState title="No reviews yet" description="Be the first student to leave feedback for this course." />
                                    ) : (
                                        course.ratings.map((rating: CourseRating) => (
                                            <div key={rating.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-semibold text-slate-900">{rating.student?.name ?? 'Student'}</p>
                                                    <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                                                        <Star className="size-4 fill-current" />
                                                        {rating.rating}/5
                                                    </span>
                                                </div>
                                                {rating.review ? <p className="mt-2 text-sm text-slate-600">{rating.review}</p> : null}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
