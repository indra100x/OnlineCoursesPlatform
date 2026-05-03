import { type FormEvent, startTransition, useEffect, useEffectEvent, useState } from 'react';
import { BookOpen, Plus, Users } from 'lucide-react';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { StatsCard } from '@/components/platform/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Course, PlatformUser } from '@/types/platform';

type ChapterFormState = {
    title: string;
    content_type: 'text' | 'video' | 'file';
    content: string;
    video_url: string;
    file: File | null;
};

const initialChapterForm: ChapterFormState = {
    title: '',
    content_type: 'text',
    content: '',
    video_url: '',
    file: null,
};

export default function TeacherDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<PlatformUser[]>([]);
    const [courseForm, setCourseForm] = useState({ title: '', description: '' });
    const [chapterForm, setChapterForm] = useState<ChapterFormState>(initialChapterForm);
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

                    return (
                        response.data.courses.find((course: Course) => course.id === current.id) ??
                        response.data.courses[0]
                    );
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
            await api.post('/courses', courseForm);
            setCourseForm({ title: '', description: '' });
            await loadCourses();
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to create the course.');
        }
    }

    async function handleDeleteCourse(courseId: number) {
        if (!window.confirm('Delete this course and its chapters?')) {
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

        const payload = new FormData();
        payload.append('title', chapterForm.title);
        payload.append('content_type', chapterForm.content_type);

        if (chapterForm.content_type === 'text') {
            payload.append('content', chapterForm.content);
        }

        if (chapterForm.content_type === 'video') {
            payload.append('video_url', chapterForm.video_url);
        }

        if (chapterForm.content_type === 'file' && chapterForm.file) {
            payload.append('file', chapterForm.file);
        }

        try {
            await api.post(`/courses/${selectedCourse.id}/chapters`, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setChapterForm(initialChapterForm);
            await loadCourses();
            await loadStudents(selectedCourse.id);
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to add the chapter.');
        }
    }

    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                <StatsCard label="Courses" value={courses.length} hint="Courses created by your teaching account." />
                <StatsCard
                    label="Enrollments"
                    value={courses.reduce((total, course) => total + (course.enrollments_count ?? 0), 0)}
                    hint="Students currently enrolled across all courses."
                />
                <StatsCard
                    label="Chapters"
                    value={courses.reduce((total, course) => total + (course.chapters_count ?? 0), 0)}
                    hint="Learning content published inside your courses."
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[380px,1fr]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                        <h2 className="text-xl font-semibold text-slate-950">Create course</h2>
                        <p className="mt-1 text-sm text-slate-600">Each course gets its own auto-generated enrollment code.</p>

                        <form className="mt-6 space-y-4" onSubmit={handleCreateCourse}>
                            <div className="space-y-2">
                                <Label htmlFor="course-title">Title</Label>
                                <Input
                                    id="course-title"
                                    value={courseForm.title}
                                    onChange={(event) =>
                                        setCourseForm((current) => ({ ...current, title: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course-description">Description</Label>
                                <textarea
                                    id="course-description"
                                    className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    value={courseForm.description}
                                    onChange={(event) =>
                                        setCourseForm((current) => ({ ...current, description: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <Button type="submit" className="rounded-2xl">
                                <Plus className="size-4" />
                                Create course
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                        <h2 className="text-xl font-semibold text-slate-950">Your courses</h2>
                        <div className="mt-4 space-y-3">
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading courses...</p>
                            ) : courses.length === 0 ? (
                                <EmptyState title="No courses yet" description="Create your first course to unlock chapters and enrollment codes." />
                            ) : (
                                courses.map((course) => (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => setSelectedCourse(course)}
                                        className={`w-full rounded-3xl border p-4 text-left transition ${
                                            selectedCourse?.id === course.id
                                                ? 'border-slate-900 bg-slate-950 text-white'
                                                : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">{course.title}</p>
                                                <p className={`mt-1 text-sm ${selectedCourse?.id === course.id ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {course.description}
                                                </p>
                                            </div>
                                            <BookOpen className="size-5 shrink-0" />
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                                            <span>Code {course.enrollment_code}</span>
                                            <span>{course.enrollments_count ?? 0} students</span>
                                            <span>{course.chapters_count ?? 0} chapters</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {selectedCourse ? (
                        <>
                            <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                                            Enrollment code {selectedCourse.enrollment_code}
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedCourse.title}</h2>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-600">{selectedCourse.description}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="rounded-2xl"
                                        onClick={() => void handleDeleteCourse(selectedCourse.id)}
                                    >
                                        Delete course
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                                    <h3 className="text-xl font-semibold text-slate-950">Add chapter</h3>
                                    <p className="mt-1 text-sm text-slate-600">Publishing a chapter automatically creates student notifications.</p>

                                    <form className="mt-6 space-y-4" onSubmit={handleAddChapter}>
                                        <div className="space-y-2">
                                            <Label htmlFor="chapter-title">Chapter title</Label>
                                            <Input
                                                id="chapter-title"
                                                value={chapterForm.title}
                                                onChange={(event) =>
                                                    setChapterForm((current) => ({ ...current, title: event.target.value }))
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="chapter-type">Content type</Label>
                                            <select
                                                id="chapter-type"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                                value={chapterForm.content_type}
                                                onChange={(event) =>
                                                    setChapterForm((current) => ({
                                                        ...current,
                                                        content_type: event.target.value as ChapterFormState['content_type'],
                                                    }))
                                                }
                                            >
                                                <option value="text">Text</option>
                                                <option value="video">Video link</option>
                                                <option value="file">File upload</option>
                                            </select>
                                        </div>

                                        {chapterForm.content_type === 'text' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="chapter-content">Content</Label>
                                                <textarea
                                                    id="chapter-content"
                                                    className="min-h-36 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                                    value={chapterForm.content}
                                                    onChange={(event) =>
                                                        setChapterForm((current) => ({ ...current, content: event.target.value }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        ) : null}

                                        {chapterForm.content_type === 'video' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="chapter-video">Video URL</Label>
                                                <Input
                                                    id="chapter-video"
                                                    type="url"
                                                    value={chapterForm.video_url}
                                                    onChange={(event) =>
                                                        setChapterForm((current) => ({ ...current, video_url: event.target.value }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        ) : null}

                                        {chapterForm.content_type === 'file' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="chapter-file">File</Label>
                                                <Input
                                                    id="chapter-file"
                                                    type="file"
                                                    onChange={(event) =>
                                                        setChapterForm((current) => ({
                                                            ...current,
                                                            file: event.target.files?.[0] ?? null,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        ) : null}

                                        {error ? <p className="text-sm text-red-600">{error}</p> : null}

                                        <Button type="submit" className="rounded-2xl">
                                            Publish chapter
                                        </Button>
                                    </form>
                                </div>

                                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                                    <div className="flex items-center gap-3">
                                        <Users className="size-5 text-sky-700" />
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-950">Enrolled students</h3>
                                            <p className="text-sm text-slate-600">Students currently in this course.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {students.length === 0 ? (
                                            <EmptyState title="No students enrolled yet" description="Share the enrollment code with students to populate this list." />
                                        ) : (
                                            students.map((student) => (
                                                <div key={student.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                                                    <p className="font-semibold text-slate-900">{student.name}</p>
                                                    <p className="text-sm text-slate-600">{student.email}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <EmptyState title="Pick a course" description="Select a course from the left to manage chapters and student enrollment." />
                    )}
                </div>
            </section>
        </div>
    );
}
