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
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200">
                <ArrowLeft className="size-4" />
                Back to student dashboard
            </Link>

            {loading ? (
                <p className="text-sm text-gray-300">Loading course chapters...</p>
            ) : error ? (
                <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6 text-sm text-red-300 backdrop-blur-sm">{error}</div>
            ) : !course ? (
                <EmptyState title="Course not found" description="This course is unavailable or you no longer have access." />
            ) : (
                <>
                    <section className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-8 text-white shadow-xl shadow-purple-500/10 backdrop-blur-xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
                            Enrollment code: <span className="font-mono text-purple-200">{course.enrollment_code}</span>
                        </p>
                        <h1 className="mt-4 text-4xl font-bold leading-tight">{course.title}</h1>
                        <p className="mt-4 max-w-3xl text-base text-gray-200">{course.description}</p>
                        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">Teacher:</span>
                                <span className="font-semibold text-white">{course.teacher.name}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-amber-300">
                                    {course.ratings_avg_rating ? Number(course.ratings_avg_rating).toFixed(1) : 'Not rated'} out of 5
                                </span>
                            </div>
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
                                        className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 backdrop-blur-sm"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg">
                                                <FileText className="size-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                                    Chapter {chapter.position}
                                                </p>
                                                <h2 className="mt-2 text-xl font-bold text-white">{chapter.title}</h2>
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4 text-sm text-gray-300">
                                            <a
                                                href={`/storage/${chapter.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 font-semibold text-purple-300 transition-colors hover:text-purple-200"
                                            >
                                                📄 Open: {chapter.file_name}
                                            </a>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                <h2 className="text-xl font-bold text-white">Rate this course</h2>
                                <p className="mt-2 text-sm text-gray-300">Share your experience to help other learners make their decision.</p>

                                <form className="mt-6 space-y-4" onSubmit={handleRatingSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="course-rating" className="text-gray-200">Rating (1-5)</Label>
                                        <Input
                                            id="course-rating"
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={ratingForm.rating}
                                            onChange={(event) => setRatingForm((current) => ({ ...current, rating: event.target.value }))}
                                            className="border-purple-500/30 bg-purple-500/10 text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="course-review" className="text-gray-200">Review</Label>
                                        <textarea
                                            id="course-review"
                                            className="min-h-32 w-full rounded-md border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm text-white placeholder-gray-400"
                                            value={ratingForm.review}
                                            onChange={(event) => setRatingForm((current) => ({ ...current, review: event.target.value }))}
                                            placeholder="What was strong? What could be better?"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50">
                                        Save rating
                                    </Button>
                                </form>
                            </div>

                            <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                <h2 className="text-xl font-bold text-white">Student feedback</h2>
                                <div className="mt-6 space-y-3">
                                    {!course.ratings || course.ratings.length === 0 ? (
                                        <EmptyState title="No reviews yet" description="Be the first student to leave feedback for this course." />
                                    ) : (
                                        course.ratings.map((rating: CourseRating) => (
                                            <div key={rating.id} className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4 transition-all hover:border-purple-500/40">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-semibold text-white">{rating.student?.name ?? 'Student'}</p>
                                                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-300">
                                                        <Star className="size-3 fill-current" />
                                                        {rating.rating}/5
                                                    </div>
                                                </div>
                                                {rating.review ? <p className="mt-2 text-sm text-gray-300">{rating.review}</p> : null}
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
