import { ArrowLeft, FileText, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/platform/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { assetUrl } from '@/lib/utils';
import type { CourseRating, StudentCourse } from '@/types/platform';

export default function CourseDetailsPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<StudentCourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ratingForm, setRatingForm] = useState({ rating: '5', review: '' });

    const loadCourse = useCallback(async () => {
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
    }, [courseId]);

    useEffect(() => {
        const init = async () => {
            await loadCourse();
        };

        void init();
    }, [loadCourse]);

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
        } catch (submitError: unknown) {
            const message = submitError instanceof Error
                ? (submitError as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            setError(message ?? 'Unable to save your rating.');
        }
    }

    return (
        <div className="space-y-5">
            <Link to="/dashboard/student" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/50 transition-colors hover:text-black">
                <ArrowLeft className="size-3.5" />
                Back to student dashboard
            </Link>

            {loading ? (
                <p className="text-sm text-black/45">Loading course chapters...</p>
            ) : error ? (
                <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-5 text-xs text-red-600">{error}</div>
            ) : !course ? (
                <EmptyState title="Course not found" description="This course is unavailable or you no longer have access." />
            ) : (
                <>
                    <section className="brand-surface-dark p-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                            Code: <span className="font-mono text-white">{course.enrollment_code}</span>
                        </p>
                        <h1 className="mt-3 text-3xl font-black leading-tight">{course.title}</h1>
                        <p className="mt-2 max-w-3xl text-sm text-white/70">{course.description}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-white/50">Teacher:</span>
                                <Link to={`/dashboard/teachers/${course.teacher.id}`} className="text-sm font-semibold text-white underline decoration-white/25 underline-offset-4 transition hover:text-[#ffd84d]">
                                    {course.teacher.name}
                                </Link>
                            </div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd84d] px-3 py-1 text-xs">
                                <Star className="size-3 fill-black text-black" />
                                <span className="font-semibold text-black">
                                    {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'Not rated'} / 5
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
                        <div className="space-y-3">
                            {!course.chapters || course.chapters.length === 0 ? (
                                <EmptyState title="No chapters yet" description="Your teacher has not published any chapter content yet." />
                            ) : (
                                course.chapters.map((chapter) => (
                                    <article
                                        key={chapter.id}
                                        className="brand-surface p-5 brand-card-hover"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-black text-white shadow-sm">
                                                <FileText className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb]">
                                                    Chapter {chapter.position}
                                                </p>
                                                <h2 className="mt-1 text-base font-bold text-black">{chapter.title}</h2>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-[1.15rem] border border-black/8 bg-[#fffdf7] px-4 py-3 text-xs text-black/60">
                                            <a
                                                href={assetUrl(chapter.file_path) ?? '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 font-semibold text-black transition-colors hover:text-[#2563eb]"
                                            >
                                                Open file: {chapter.file_name}
                                            </a>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        <div className="space-y-5">
                            <div className="brand-surface p-5">
                                <h2 className="text-base font-bold text-black">Rate this course</h2>
                                <p className="mt-1 text-xs text-black/50">Share your experience to help other learners.</p>

                                <form className="mt-4 space-y-3.5" onSubmit={handleRatingSubmit}>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="course-rating" className="text-xs font-semibold">Rating (1-5)</Label>
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
                                    <div className="space-y-1.5">
                                        <Label htmlFor="course-review" className="text-xs font-semibold">Review</Label>
                                        <textarea
                                            id="course-review"
                                            className="min-h-28 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                                            value={ratingForm.review}
                                            onChange={(event) => setRatingForm((current) => ({ ...current, review: event.target.value }))}
                                            placeholder="What was strong? What could be better?"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full rounded-xl bg-black text-white hover:bg-black/90">
                                        Save rating
                                    </Button>
                                </form>
                            </div>

                            <div className="brand-surface p-5">
                                <h2 className="text-base font-bold text-black">Student feedback</h2>
                                <div className="mt-4 space-y-2.5">
                                    {!course.ratings || course.ratings.length === 0 ? (
                                        <EmptyState title="No reviews yet" description="Be the first student to leave feedback for this course." />
                                    ) : (
                                        course.ratings.map((rating: CourseRating) => (
                                            <div key={rating.id} className="rounded-[1.15rem] border border-black/8 bg-[#fffdf7] p-3.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-black">{rating.student?.name ?? 'Student'}</p>
                                                    <div className="inline-flex items-center gap-1 rounded-full bg-[#ffd84d] px-2.5 py-0.5 text-xs text-black">
                                                        <Star className="size-3 fill-current" />
                                                        {rating.rating}/5
                                                    </div>
                                                </div>
                                                {rating.review ? <p className="mt-1.5 text-xs text-black/55">{rating.review}</p> : null}
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
