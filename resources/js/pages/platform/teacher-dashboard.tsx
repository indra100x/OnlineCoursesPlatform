import { type FormEvent, startTransition, useEffect, useEffectEvent, useState } from 'react';
import { BookOpen, DollarSign, FileText, Plus, Star, Trash2, Users, Video, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Course, PlatformUser } from '@/types/platform';

type ChapterType = 'pdf' | 'video' | 'link';

const initialChapterForm = {
    title: '',
    type: 'pdf' as ChapterType,
    file: null as File | null,
    videoFile: null as File | null,
    url: '',
};

export default function TeacherDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<PlatformUser[]>([]);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '49.00' });
    const [chapterForm, setChapterForm] = useState(initialChapterForm);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadCourses = useEffectEvent(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get<{ courses: Course[] }>('/courses');
            setCourses(response.data.courses);

            startTransition(() => {
                setSelectedCourse((current) => {
                    if (!response.data.courses.length) {
                        return null;
                    }

                    if (!current) {
                        return response.data.courses[0];
                    }

                    return response.data.courses.find((course) => course.id === current.id) ?? response.data.courses[0];
                });
            });
        } catch {
            setError('Unable to load courses right now.');
        } finally {
            setLoading(false);
        }
    });

    const loadStudents = useEffectEvent(async (courseId: number) => {
        try {
            const response = await api.get<{ students: PlatformUser[] }>(`/courses/${courseId}/students`);
            setStudents(response.data.students);
        } catch {
            setStudents([]);
        }
    });

    useEffect(() => {
        void loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            void loadStudents(selectedCourse.id);
        } else {
            setStudents([]);
        }
    }, [selectedCourse]);

    async function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            await api.post('/courses', {
                ...courseForm,
                price: Number(courseForm.price),
            });
            setCourseForm({ title: '', description: '', price: '49.00' });
            await loadCourses();
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to create the course.');
        }
    }

    async function handleDeleteCourse(courseId: number) {
        if (!window.confirm('Delete this course and all of its chapters?')) {
            return;
        }

        try {
            await api.delete(`/courses/${courseId}`);
            await loadCourses();
        } catch {
            setError('Unable to delete the course.');
        }
    }

    async function handleAddChapter(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedCourse) {
            return;
        }

        if (chapterForm.type === 'pdf' && !chapterForm.file) {
            return;
        }

        if (chapterForm.type === 'video' && !chapterForm.videoFile) {
            return;
        }

        if (chapterForm.type === 'link' && !chapterForm.url) {
            return;
        }

        try {
            if (chapterForm.type === 'pdf') {
                const payload = new FormData();
                payload.append('title', chapterForm.title);
                payload.append('file', chapterForm.file!);

                await api.post(`/courses/${selectedCourse.id}/chapters`, payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else if (chapterForm.type === 'video') {
                const payload = new FormData();
                payload.append('title', chapterForm.title);
                payload.append('type', 'video');
                payload.append('video_file', chapterForm.videoFile!);

                await api.post(`/courses/${selectedCourse.id}/chapters`, payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await api.post(`/courses/${selectedCourse.id}/chapters`, {
                    title: chapterForm.title,
                    type: chapterForm.type,
                    url: chapterForm.url,
                });
            }

            setChapterForm(initialChapterForm);
            await loadCourses();
            await loadStudents(selectedCourse.id);
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to add the chapter.');
        }
    }

    return (
        <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-4">
                <div className="brand-surface p-5">
                    <p className="brand-kicker">Courses</p>
                    <p className="mt-2 text-3xl font-black text-black">{courses.length}</p>
                    <p className="mt-1 text-sm text-black/50">Published courses</p>
                </div>
                <div className="brand-surface p-5">
                    <p className="brand-kicker">Catalog value</p>
                    <p className="mt-2 text-3xl font-black text-black">
                        ${courses.reduce((total, course) => total + Number(course.price || 0), 0).toFixed(0)}
                    </p>
                    <p className="mt-1 text-sm text-black/50">Total price across courses</p>
                </div>
                <div className="brand-surface-blue p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Students</p>
                    <p className="mt-2 text-3xl font-black text-white">
                        {courses.reduce((total, course) => total + (course.enrollments_count ?? 0), 0)}
                    </p>
                    <p className="mt-1 text-sm text-white/65">Current enrollments</p>
                </div>
                <div className="brand-surface-accent p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">Ratings</p>
                    <p className="mt-2 text-3xl font-black text-black">
                        {courses.reduce((total, course) => total + (course.ratings_count ?? 0), 0)}
                    </p>
                    <p className="mt-1 text-sm text-black/55">Feedback entries</p>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[380px,1fr]">
                <div className="space-y-5">
                    <div className="brand-surface p-5">
                        <h2 className="text-base font-semibold text-black">Launch a course</h2>
                        <p className="mt-0.5 text-xs text-black/50">Add a price, shape the offer, and prepare it for student purchases.</p>

                        <form className="mt-4 space-y-3.5" onSubmit={handleCreateCourse}>
                            <div className="space-y-1.5">
                                <Label htmlFor="course-title" className="text-xs font-semibold">Title</Label>
                                <Input
                                    id="course-title"
                                    value={courseForm.title}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="course-price" className="text-xs font-semibold">Price</Label>
                                <Input
                                    id="course-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={courseForm.price}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, price: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="course-description" className="text-xs font-semibold">Description</Label>
                                <textarea
                                    id="course-description"
                                    className="min-h-28 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                                    value={courseForm.description}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
                                    required
                                />
                            </div>
                            <Button type="submit" className="rounded-xl bg-black text-white hover:bg-black/90">
                                <Plus className="size-4" />
                                Create course
                            </Button>
                        </form>
                    </div>

                    <div className="brand-surface p-5">
                        <h2 className="text-base font-semibold text-black">Your courses</h2>
                        <div className="mt-3 space-y-2">
                            {loading ? (
                                <p className="text-sm text-black/45">Loading courses...</p>
                            ) : courses.length === 0 ? (
                                <EmptyState title="No courses yet" description="Create your first course to start selling beta access and publishing PDF chapters." />
                            ) : (
                                courses.map((course) => (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => setSelectedCourse(course)}
                                        className={`w-full rounded-[1.25rem] border p-4 text-left transition-all ${
                                            selectedCourse?.id === course.id
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/8 bg-[#fffdf7] hover:border-[#2563eb]/30 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{course.title}</p>
                                                <p className={`mt-0.5 text-xs line-clamp-2 ${selectedCourse?.id === course.id ? 'text-white/65' : 'text-black/55'}`}>
                                                    {course.description}
                                                </p>
                                            </div>
                                            <BookOpen className="size-4 shrink-0" />
                                        </div>
                                        <div className={`mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${selectedCourse?.id === course.id ? 'text-white/60' : 'text-black/45'}`}>
                                            <span>${Number(course.price).toFixed(2)}</span>
                                            <span>{course.enrollments_count ?? 0} students</span>
                                            <span>{course.ratings_avg_rating ? `${Number(course.ratings_avg_rating).toFixed(1)} stars` : 'No ratings'}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    {selectedCourse ? (
                        <>
                            <div className="brand-surface-dark p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                                            Code: {selectedCourse.enrollment_code}
                                        </p>
                                        <h2 className="mt-1.5 text-xl font-bold text-white">{selectedCourse.title}</h2>
                                        <p className="mt-1 max-w-2xl text-sm text-white/65">{selectedCourse.description}</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                            <span className="rounded-full bg-[#ffd84d] px-3 py-1 font-medium text-black">
                                                ${Number(selectedCourse.price).toFixed(2)}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-white/65">
                                                <Star className="size-3.5 fill-[#ffd84d] text-[#ffd84d]" />
                                                {selectedCourse.ratings_avg_rating ? Number(selectedCourse.ratings_avg_rating).toFixed(1) : 'No rating yet'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 rounded-[1rem] border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        onClick={() => void handleDeleteCourse(selectedCourse.id)}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="brand-surface p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-black">PDF Chapter</h3>
                                        <FileText className="size-4 text-[#ef4444]" />
                                    </div>
                                    <p className="mt-1 text-xs text-black/50">Upload a PDF file as a chapter.</p>
                                    <button
                                        type="button"
                                        onClick={() => setChapterForm((current) => ({ ...current, type: 'pdf' }))}
                                        className={`mt-3 w-full rounded-[0.9rem] border px-3 py-2 text-xs font-medium transition ${
                                            chapterForm.type === 'pdf'
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/10 bg-white text-black hover:border-[#ef4444]'
                                        }`}
                                    >
                                        {chapterForm.type === 'pdf' ? 'Selected' : 'Select'}
                                    </button>
                                </div>

                                <div className="brand-surface p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-black">Video Chapter</h3>
                                        <Video className="size-4 text-[#2563eb]" />
                                    </div>
                                    <p className="mt-1 text-xs text-black/50">Upload a video file.</p>
                                    <button
                                        type="button"
                                        onClick={() => setChapterForm((current) => ({ ...current, type: 'video' }))}
                                        className={`mt-3 w-full rounded-[0.9rem] border px-3 py-2 text-xs font-medium transition ${
                                            chapterForm.type === 'video'
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/10 bg-white text-black hover:border-[#2563eb]'
                                        }`}
                                    >
                                        {chapterForm.type === 'video' ? 'Selected' : 'Select'}
                                    </button>
                                </div>

                                <div className="brand-surface p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-black">Link Chapter</h3>
                                        <LinkIcon className="size-4 text-[#ffd84d]" />
                                    </div>
                                    <p className="mt-1 text-xs text-black/50">Add a link to external content.</p>
                                    <button
                                        type="button"
                                        onClick={() => setChapterForm((current) => ({ ...current, type: 'link' }))}
                                        className={`mt-3 w-full rounded-[0.9rem] border px-3 py-2 text-xs font-medium transition ${
                                            chapterForm.type === 'link'
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/10 bg-white text-black hover:border-[#ffd84d]'
                                        }`}
                                    >
                                        {chapterForm.type === 'link' ? 'Selected' : 'Select'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
                                <div className="brand-surface p-5">
                                    <h3 className="text-base font-semibold text-black">
                                        Create {chapterForm.type === 'pdf' ? 'PDF' : chapterForm.type === 'video' ? 'Video' : 'Link'} Chapter
                                    </h3>
                                    <p className="mt-0.5 text-xs text-black/50">
                                        {chapterForm.type === 'pdf'
                                            ? 'Upload a PDF chapter and trigger student notifications.'
                                            : chapterForm.type === 'video'
                                                ? 'Upload a video file for your students to watch.'
                                                : 'Add a link to external learning resources.'}
                                    </p>

                                    <form className="mt-4 space-y-3.5" onSubmit={handleAddChapter}>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="chapter-title" className="text-xs font-semibold">Chapter title</Label>
                                            <Input
                                                id="chapter-title"
                                                value={chapterForm.title}
                                                onChange={(event) =>
                                                    setChapterForm((current) => ({ ...current, title: event.target.value }))
                                                }
                                                required
                                            />
                                        </div>

                                        {chapterForm.type === 'pdf' ? (
                                            <div className="space-y-1.5">
                                                <Label htmlFor="chapter-file" className="text-xs font-semibold">PDF file</Label>
                                                <Input
                                                    id="chapter-file"
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(event) =>
                                                        setChapterForm((current) => ({
                                                            ...current,
                                                            file: event.target.files?.[0] ?? null,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        ) : chapterForm.type === 'video' ? (
                                            <div className="space-y-1.5">
                                                <Label htmlFor="chapter-video" className="text-xs font-semibold">Video file</Label>
                                                <Input
                                                    id="chapter-video"
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(event) =>
                                                        setChapterForm((current) => ({
                                                            ...current,
                                                            videoFile: event.target.files?.[0] ?? null,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <Label htmlFor="chapter-url" className="text-xs font-semibold">Link URL</Label>
                                                <Input
                                                    id="chapter-url"
                                                    type="url"
                                                    value={chapterForm.url}
                                                    onChange={(event) =>
                                                        setChapterForm((current) => ({ ...current, url: event.target.value }))
                                                    }
                                                    placeholder="https://..."
                                                    required
                                                />
                                            </div>
                                        )}

                                        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}

                                        <Button type="submit" className="rounded-xl bg-black text-white hover:bg-black/90">
                                            <Plus className="size-4" />
                                            Create chapter
                                        </Button>
                                    </form>
                                </div>

                                <div className="brand-surface p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-black text-white">
                                            <Users className="size-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-black">Enrolled students</h3>
                                            <p className="text-xs text-black/50">Students currently learning inside this course.</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {students.length === 0 ? (
                                            <EmptyState title="No students enrolled yet" description="Beta buyers can unlock the code, then enroll here once they use it." />
                                        ) : (
                                            students.map((student) => (
                                                <Link
                                                    key={student.id}
                                                    to={`/dashboard/students/${student.id}`}
                                                    className="block rounded-[1.15rem] border border-black/8 bg-[#fffdf7] p-3.5 transition hover:border-[#2563eb]/20 hover:shadow-sm"
                                                >
                                                    <p className="text-sm font-semibold text-black">{student.name}</p>
                                                    <p className="text-xs text-black/50">{student.email}</p>
                                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                                                        View profile
                                                    </p>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <EmptyState title="Pick a course" description="Select a course from the left to manage pricing, PDF chapters, and enrolled students." />
                    )}
                </div>
            </section>
        </div>
    );
}
