import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Course, PlatformNotification, StudentCourse } from '@/types/platform';

type Tab = 'courses' | 'catalog' | 'wishlist' | 'notifications';

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type UseStudentDataOptions = {
    onUnreadCountChange?: (count: number) => void;
};

export function useStudentData(activeTab: Tab, options: UseStudentDataOptions = {}) {
    const { onUnreadCountChange } = options;
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [catalog, setCatalog] = useState<Course[]>([]);
    const [catalogMeta, setCatalogMeta] = useState<PaginationMeta | null>(null);
    const [catalogPage, setCatalogPage] = useState(1);
    const [wishlist, setWishlist] = useState<Course[]>([]);
    const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadCourses = useCallback(async () => {
        try {
            const response = await api.get<StudentCourse[]>('/my-courses');
            setCourses(response.data);
        } catch {
            setError('Unable to load your courses right now.');
        }
    }, []);

    const loadCatalog = useCallback(async (page = 1) => {
        try {
            const response = await api.get<{ data: Course[]; meta: PaginationMeta }>('/catalog', {
                params: { page, per_page: 20 },
            });
            setCatalog(response.data.data);
            setCatalogMeta(response.data.meta);
            setCatalogPage(page);
        } catch {
            setError('Unable to load the catalog right now.');
        }
    }, []);

    const loadWishlist = useCallback(async () => {
        try {
            const response = await api.get<{ courses: Course[] }>('/wishlist');
            setWishlist(response.data.courses);
        } catch {
            setWishlist([]);
        }
    }, []);

    const loadNotifications = useCallback(async () => {
        try {
            const response = await api.get<PlatformNotification[]>('/notifications');
            const items = response.data;
            setNotifications(items);

            return items;
        } catch {
            setError('Unable to load notifications right now.');

            return [];
        }
    }, []);

    useEffect(() => {
        const loadDataForTab = async () => {
            switch (activeTab) {
                case 'courses':
                    await loadCourses();
                    break;
                case 'catalog':
                    await loadCatalog(1);
                    break;
                case 'wishlist':
                    await loadWishlist();
                    break;
                case 'notifications':
                    await loadNotifications();
                    break;
            }
        };

        void loadDataForTab();
    }, [activeTab, loadCourses, loadCatalog, loadWishlist, loadNotifications]);

    useEffect(() => {
        const fetchUnread = async () => {
            if (activeTab !== 'notifications' && onUnreadCountChange) {
                const items = await loadNotifications();
                onUnreadCountChange(items.filter((item) => !item.is_read).length);
            }
        };

        void fetchUnread();
    }, [activeTab, loadNotifications, onUnreadCountChange]);

    const handlePurchase = useCallback(async (courseId: number) => {
        try {
            await api.post(`/courses/${courseId}/purchase`);

            if (activeTab === 'catalog') {
                await loadCatalog(catalogPage);
            }

            if (activeTab === 'wishlist') {
                await loadWishlist();
            }

            if (activeTab === 'courses') {
                await loadCourses();
            }
        } catch (submitError: unknown) {
            const message = submitError instanceof Error
                ? (submitError as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            setError(message ?? 'Unable to complete the beta purchase.');
        }
    }, [activeTab, loadCatalog, loadWishlist, loadCourses, catalogPage]);

    const toggleWishlist = useCallback(async (course: Course) => {
        try {
            if (course.is_wishlisted) {
                await api.delete(`/wishlist/${course.id}`);
            } else {
                await api.post('/wishlist', { course_id: course.id });
            }

            if (activeTab === 'catalog') {
                await loadCatalog(catalogPage);
            }

            if (activeTab === 'wishlist') {
                await loadWishlist();
            }
        } catch {
            setError('Unable to update the wishlist right now.');
        }
    }, [activeTab, loadCatalog, loadWishlist, catalogPage]);

    const enrollWithCode = useCallback(async (code: string) => {
        try {
            await api.post('/enroll', { enrollment_code: code });

            if (activeTab === 'courses') {
                await loadCourses();
            }

            if (activeTab === 'catalog') {
                await loadCatalog(catalogPage);
            }
        } catch (submitError: unknown) {
            const message = submitError instanceof Error
                ? (submitError as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            setError(message ?? 'Enrollment failed.');
        }
    }, [activeTab, loadCourses, loadCatalog, catalogPage]);

    const markAsRead = useCallback(async (notificationId: number) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            const items = await loadNotifications();

            return items;
        } catch {
            setError('Unable to mark this notification as read.');

            return [];
        }
    }, [loadNotifications]);

    const goToCatalogPage = useCallback(async (page: number) => {
        await loadCatalog(page);
    }, [loadCatalog]);

    return {
        courses,
        catalog,
        catalogMeta,
        catalogPage,
        wishlist,
        notifications,
        error,
        setError,
        handlePurchase,
        toggleWishlist,
        enrollWithCode,
        markAsRead,
        loadNotifications,
        goToCatalogPage,
    };
}
