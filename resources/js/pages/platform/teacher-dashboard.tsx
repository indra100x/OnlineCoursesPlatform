import { type FormEvent, startTransition, useEffect, useEffectEvent, useState } from 'react';
import { BookOpen, FileText, Plus, Star, Users, Video, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { StatsCard } from '@/components/platform/stats-card';
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
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
                <StatsCard label="Courses" value={courses.length} hint="Courses published from your teacher workspace." />
                <StatsCard
                    label="Revenue Beta"
                    value={`$${courses.reduce((total, course) => total + Number(course.price || 0), 0).toFixed(2)}`}
                    hint="Catalog value across all your current courses."
                />
                <StatsCard
                    label="Students"
                    value={courses.reduce((total, course) => total + (course.enrollments_count ?? 0), 0)}
                    hint="Current enrollments across your course library."
                />
                <StatsCard
                    label="Ratings"
                    value={courses.reduce((total, course) => total + (course.ratings_count ?? 0), 0)}
                    hint="Feedback entries submitted by enrolled students."
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[380px,1fr]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold text-white">Launch a course</h2>
                        <p className="mt-1 text-sm text-gray-300">Add a price, make it look premium, and unlock beta buying for students.</p>

                        <form className="mt-6 space-y-4" onSubmit={handleCreateCourse}>
                            <div className="space-y-2">
                                <Label htmlFor="course-title">Title</Label>
                                <Input
                                    id="course-title"
                                    value={courseForm.title}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course-price">Price</Label>
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
                            <div className="space-y-2">
                                <Label htmlFor="course-description">Description</Label>
                                <textarea
                                    id="course-description"
                                    className="min-h-32 w-full rounded-md border border-purple-500/50 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-400"
                                    value={courseForm.description}
                                    onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
                                    required
                                />
                            </div>
                            <Button type="submit" className="rounded-2xl bg-cyan-600 text-white hover:bg-cyan-700">
                                <Plus className="size-4" />
                                Create course
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold text-white">Your premium lineup</h2>
                        <div className="mt-4 space-y-3">
                            {loading ? (
                                <p className="text-sm text-gray-400">Loading courses...</p>
                            ) : courses.length === 0 ? (
                                <EmptyState title="No courses yet" description="Create your first course to start selling beta access and publishing PDF chapters." />
                            ) : (
                                courses.map((course) => (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => setSelectedCourse(course)}
                                        className={`w-full rounded-3xl border p-4 text-left transition ${
                                            selectedCourse?.id === course.id
                                                ? 'border-cyan-700 bg-cyan-700 text-white'
                                                : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">{course.title}</p>
                                                <p className={`mt-1 text-sm ${selectedCourse?.id === course.id ? 'text-cyan-100' : 'text-slate-600'}`}>
                                                    {course.description}
                                                </p>
                                            </div>
                                            <BookOpen className="size-5 shrink-0" />
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
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

                <div className="space-y-6">
                    {selectedCourse ? (
                        <>
                            <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                                            Enrollment code {selectedCourse.enrollment_code}
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold text-white">{selectedCourse.title}</h2>
                                        <p className="mt-2 max-w-2xl text-sm text-gray-300">{selectedCourse.description}</p>
                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                                            <span className="rounded-full bg-amber-500/20 px-3 py-1 font-medium text-amber-300">
                                                ${Number(selectedCourse.price).toFixed(2)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                                {selectedCourse.ratings_avg_rating ? Number(selectedCourse.ratings_avg_rating).toFixed(1) : 'No rating yet'}
                                            </span>
                                        </div>
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

                            <div className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-3">
                                    <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-white">PDF Chapter</h3>
                                            <FileText className="size-5 text-purple-400" />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-300">Upload a PDF file as a chapter.</p>
                                        <button
                                            type="button"
                                            onClick={() => setChapterForm((current) => ({ ...current, type: 'pdf' }))}
                                            className={`mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                                chapterForm.type === 'pdf'
                                                    ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                    : 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 text-gray-300 hover:border-purple-500/50'
                                            }`}
                                        >
                                            {chapterForm.type === 'pdf' ? 'Selected' : 'Select'}
                                        </button>
                                    </div>

                                    <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-white">Video Chapter</h3>
                                            <Video className="size-5 text-purple-400" />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-300">Upload a video file as a chapter.</p>
                                        <button
                                            type="button"
                                            onClick={() => setChapterForm((current) => ({ ...current, type: 'video' }))}
                                            className={`mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                                chapterForm.type === 'video'
                                                    ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                    : 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 text-gray-300 hover:border-purple-500/50'
                                            }`}
                                        >
                                            {chapterForm.type === 'video' ? 'Selected' : 'Select'}
                                        </button>
                                    </div>

                                    <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-white">Link Chapter</h3>
                                            <LinkIcon className="size-5 text-purple-400" />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-300">Add a link to external content.</p>
                                        <button
                                            type="button"
                                            onClick={() => setChapterForm((current) => ({ ...current, type: 'link' }))}
                                            className={`mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                                chapterForm.type === 'link'
                                                    ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                    : 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 text-gray-300 hover:border-purple-500/50'
                                            }`}
                                        >
                                            {chapterForm.type === 'link' ? 'Selected' : 'Select'}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                                    <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                        <h3 className="text-xl font-semibold text-white">
                                            Create {chapterForm.type === 'pdf' ? 'PDF' : chapterForm.type === 'video' ? 'Video' : 'Link'} Chapter
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-300">
                                            {chapterForm.type === 'pdf'
                                                ? 'Upload a PDF chapter and trigger student notifications.'
                                                : chapterForm.type === 'video'
                                                  ? 'Upload a video file for your students to watch.'
                                                  : 'Add a link to external learning resources.'}
                                        </p>

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

                                            {chapterForm.type === 'pdf' ? (
                                                <div className="space-y-2">
                                                    <Label htmlFor="chapter-file">PDF file</Label>
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
                                                <div className="space-y-2">
                                                    <Label htmlFor="chapter-video">Video file</Label>
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
                                                <div className="space-y-2">
                                                    <Label htmlFor="chapter-url">Link URL</Label>
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

                                            {error ? <p className="text-sm text-red-600">{error}</p> : null}

                                            <Button type="submit" className="rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                                                <Plus className="size-4" />
                                                Create chapter
                                            </Button>
                                        </form>
                                    </div>

                                    <div className="rounded-[2rem] border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <Users className="size-5 text-purple-400" />
                                            <div>
                                                <h3 className="text-xl font-semibold text-white">Enrolled students</h3>
                                                <p className="text-sm text-gray-300">Students currently learning inside this course.</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            {students.length === 0 ? (
                                                <EmptyState title="No students enrolled yet" description="Beta buyers can unlock the code, then enroll here once they use it." />
                                            ) : (
                                                students.map((student) => (
                                                    <div key={student.id} className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-4">
                                                        <p className="font-semibold text-white">{student.name}</p>
                                                        <p className="text-sm text-gray-400">{student.email}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
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
