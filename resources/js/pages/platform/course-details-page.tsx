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
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-sm font-semibold text-black/65 transition-colors hover:text-black">
                <ArrowLeft className="size-4" />
                Back to student dashboard
            </Link>

            {loading ? (
                <p className="text-sm text-black/55">Loading course chapters...</p>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>
            ) : !course ? (
                <EmptyState title="Course not found" description="This course is unavailable or you no longer have access." />
            ) : (
                <>
                    <section className="brand-surface-dark relative overflow-hidden p-8 text-white">
                        <div className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-[#ffd84d]" />
                        <div className="absolute right-10 top-0 h-24 w-24 rounded-b-[2rem] bg-[#2563eb]" />
                        <div className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-[2rem] bg-[#ef4444]" />
                        <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-white/60">
                            Enrollment code: <span className="font-mono text-white">{course.enrollment_code}</span>
                        </p>
                        <h1 className="relative z-10 mt-4 text-4xl font-black leading-tight">{course.title}</h1>
                        <p className="relative z-10 mt-4 max-w-3xl text-base text-white/75">{course.description}</p>
                        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-white/55">Teacher:</span>
                                <Link to={`/dashboard/teachers/${course.teacher.id}`} className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:text-[#ffd84d]">
                                    {course.teacher.name}
                                </Link>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#ffd84d] px-4 py-2">
                                <Star className="size-4 fill-black text-black" />
                                <span className="font-semibold text-black">
                                    {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'Not rated'} out of 5
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
                        <div className="space-y-4">
                            {!course.chapters || course.chapters.length === 0 ? (
                                <EmptyState title="No chapters yet" description="Your teacher has not published any chapter content yet." />
                            ) : (
                                course.chapters.map((chapter) => (
                                    <article
                                        key={chapter.id}
                                        className="brand-surface p-6 transition-all hover:border-[#2563eb]/20 hover:shadow-[0_18px_40px_rgba(37,99,235,0.08)]"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-lg">
                                                <FileText className="size-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                                                    Chapter {chapter.position}
                                                </p>
                                                <h2 className="mt-2 text-xl font-bold text-black">{chapter.title}</h2>
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-2xl border border-black/10 bg-[#fffdf7] p-4 text-sm text-black/65">
                                            <a
                                                href={`/storage/${chapter.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 font-semibold text-black transition-colors hover:text-[#2563eb]"
                                            >
                                                Open file: {chapter.file_name}
                                            </a>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="brand-surface p-6">
                                <h2 className="text-xl font-bold text-black">Rate this course</h2>
                                <p className="mt-2 text-sm text-black/60">Share your experience to help other learners make their decision.</p>

                                <form className="mt-6 space-y-4" onSubmit={handleRatingSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="course-rating">Rating (1-5)</Label>
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
                                            className="min-h-32 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/35 outline-none focus:border-[#2563eb]"
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

                            <div className="brand-surface p-6">
                                <h2 className="text-xl font-bold text-black">Student feedback</h2>
                                <div className="mt-6 space-y-3">
                                    {!course.ratings || course.ratings.length === 0 ? (
                                        <EmptyState title="No reviews yet" description="Be the first student to leave feedback for this course." />
                                    ) : (
                                        course.ratings.map((rating: CourseRating) => (
                                            <div key={rating.id} className="rounded-2xl border border-black/10 bg-[#fffdf7] p-4 transition-all hover:border-[#2563eb]/25">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-semibold text-black">{rating.student?.name ?? 'Student'}</p>
                                                    <div className="inline-flex items-center gap-1 rounded-full bg-[#ffd84d] px-3 py-1 text-sm text-black">
                                                        <Star className="size-3 fill-current" />
                                                        {rating.rating}/5
                                                    </div>
                                                </div>
                                                {rating.review ? <p className="mt-2 text-sm text-black/60">{rating.review}</p> : null}
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
