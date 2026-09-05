import { startTransition, useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '@/lib/api';
import type { Course, PlatformUser } from '@/types/platform';

const initialChapterForm = {
    title: '',
    file: null as File | null,
};

export function useTeacherData() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<PlatformUser[]>([]);
    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        price: '49.00',
    });
    const [chapterForm, setChapterForm] = useState(initialChapterForm);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadCourses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get<Course[]>('/courses');
            const coursesList = response.data;
            setCourses(coursesList);

            startTransition(() => {
                setSelectedCourse((current) => {
                    if (!coursesList.length) {
                        return null;
                    }

                    if (!current) {
                        return coursesList[0];
                    }

                    return (
                        coursesList.find(
                            (course) => course.id === current.id,
                        ) ?? coursesList[0]
                    );
                });
            });
        } catch {
            setError('Unable to load courses right now.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStudents = useCallback(async (courseId: number) => {
        try {
            const response = await api.get<{ students: PlatformUser[] }>(
                `/courses/${courseId}/students`,
            );
            setStudents(response.data.students);
        } catch {
            // Error fetching students, leave empty
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await loadCourses();
        };

        void init();
    }, [loadCourses]);

    useEffect(() => {
        const load = async () => {
            if (selectedCourse) {
                await loadStudents(selectedCourse.id);
            }
        };

        void load();
    }, [selectedCourse, loadStudents]);

    const handleCreateCourse = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setError(null);

            try {
                await api.post('/courses', {
                    ...courseForm,
                    price: Number(courseForm.price),
                });
                setCourseForm({ title: '', description: '', price: '49.00' });
                const response = await api.get<Course[]>('/courses');
                setCourses(response.data);
            } catch (submitError: unknown) {
                const message =
                    submitError instanceof Error
                        ? (
                              submitError as {
                                  response?: { data?: { message?: string } };
                              }
                          ).response?.data?.message
                        : undefined;
                setError(message ?? 'Unable to create the course.');
            }
        },
        [courseForm],
    );

    const handleDeleteCourse = useCallback(async (courseId: number) => {
        if (!window.confirm('Delete this course and all of its chapters?')) {
            return;
        }

        try {
            await api.delete(`/courses/${courseId}`);
            const response = await api.get<Course[]>('/courses');
            setCourses(response.data);
        } catch {
            setError('Unable to delete the course.');
        }
    }, []);

    const handleAddChapter = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!selectedCourse) {
                return;
            }

            if (!chapterForm.file) {
                return;
            }

            try {
                const payload = new FormData();
                payload.append('title', chapterForm.title);
                payload.append('file', chapterForm.file);

                await api.post(
                    `/courses/${selectedCourse.id}/chapters`,
                    payload,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                );

                setChapterForm(initialChapterForm);
                const coursesResponse = await api.get<Course[]>('/courses');
                setCourses(coursesResponse.data);
                await loadStudents(selectedCourse.id);
            } catch (submitError: unknown) {
                const message =
                    submitError instanceof Error
                        ? (
                              submitError as {
                                  response?: { data?: { message?: string } };
                              }
                          ).response?.data?.message
                        : undefined;
                setError(message ?? 'Unable to add the chapter.');
            }
        },
        [selectedCourse, chapterForm, loadStudents],
    );

    return {
        courses,
        selectedCourse,
        setSelectedCourse,
        students,
        courseForm,
        setCourseForm,
        chapterForm,
        setChapterForm,
        error,
        loading,
        handleCreateCourse,
        handleDeleteCourse,
        handleAddChapter,
    };
}
