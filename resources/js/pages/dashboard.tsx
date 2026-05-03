import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/platform/app-shell';
import AdminDashboard from '@/pages/platform/admin-dashboard';
import CourseDetailsPage from '@/pages/platform/course-details-page';
import ProfilePage from '@/pages/platform/profile-page';
import StudentDashboard from '@/pages/platform/student-dashboard';
import TeacherDashboard from '@/pages/platform/teacher-dashboard';
import type { User } from '@/types';

type SharedProps = {
    csrf_token: string;
    auth: {
        user: User & {
            role: 'admin' | 'teacher' | 'student';
        };
    };
};

function RoleRedirect({ role }: { role: SharedProps['auth']['user']['role'] }) {
    if (role === 'admin') {
        return <Navigate to="/dashboard/admin" replace />;
    }

    if (role === 'teacher') {
        return <Navigate to="/dashboard/teacher" replace />;
    }

    return <Navigate to="/dashboard/student" replace />;
}

export default function Dashboard() {
    const { auth, csrf_token } = usePage<SharedProps>().props;
    const [currentUser, setCurrentUser] = useState(auth.user);
    const [unreadCount, setUnreadCount] = useState(0);
    const Router = typeof window === 'undefined' ? MemoryRouter : BrowserRouter;
    const initialEntry =
        typeof window === 'undefined'
            ? '/dashboard'
            : `${window.location.pathname}${window.location.search}`;

    return (
        <>
            <Head title="Courses Platform" />
            <Router {...(Router === MemoryRouter ? { initialEntries: [initialEntry] } : {})}>
                <AppShell user={currentUser} unreadCount={unreadCount} csrfToken={csrf_token}>
                    <Routes>
                        <Route path="/dashboard" element={<RoleRedirect role={currentUser.role} />} />
                        <Route
                            path="/dashboard/admin"
                            element={
                                currentUser.role === 'admin' ? (
                                    <AdminDashboard currentUserId={currentUser.id} />
                                ) : (
                                    <RoleRedirect role={currentUser.role} />
                                )
                            }
                        />
                        <Route
                            path="/dashboard/teacher"
                            element={
                                currentUser.role === 'teacher' ? (
                                    <TeacherDashboard />
                                ) : (
                                    <RoleRedirect role={currentUser.role} />
                                )
                            }
                        />
                        <Route
                            path="/dashboard/student"
                            element={
                                currentUser.role === 'student' ? (
                                    <StudentDashboard onUnreadCountChange={setUnreadCount} />
                                ) : (
                                    <RoleRedirect role={currentUser.role} />
                                )
                            }
                        />
                        <Route
                            path="/dashboard/courses/:courseId"
                            element={
                                currentUser.role === 'student' ? (
                                    <CourseDetailsPage />
                                ) : (
                                    <RoleRedirect role={currentUser.role} />
                                )
                            }
                        />
                        <Route
                            path="/dashboard/profile"
                            element={
                                <ProfilePage
                                    onProfileRefresh={(profile) =>
                                        setCurrentUser((current) => ({
                                            ...current,
                                            name: profile.name,
                                            bio: profile.bio,
                                            avatar_path: profile.avatar_path,
                                        }))
                                    }
                                />
                            }
                        />
                        <Route path="*" element={<RoleRedirect role={currentUser.role} />} />
                    </Routes>
                </AppShell>
            </Router>
        </>
    );
}
