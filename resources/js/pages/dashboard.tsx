import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import api from '@/lib/api';
import { AppShell } from '@/components/platform/app-shell';
import AdminDashboard from '@/pages/platform/admin-dashboard';
import CourseDetailsPage from '@/pages/platform/course-details-page';
import StudentDashboard from '@/pages/platform/student-dashboard';
import TeacherDashboard from '@/pages/platform/teacher-dashboard';
import type { User } from '@/types';

type SharedProps = {
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
    const { auth } = usePage<SharedProps>().props;
    const [unreadCount, setUnreadCount] = useState(0);

    async function handleLogout() {
        await api.post('/logout');
        window.location.href = '/login';
    }

    return (
        <>
            <Head title="Courses Platform" />
            <BrowserRouter>
                <AppShell user={auth.user} unreadCount={unreadCount} onLogout={handleLogout}>
                    <Routes>
                        <Route path="/dashboard" element={<RoleRedirect role={auth.user.role} />} />
                        <Route
                            path="/dashboard/admin"
                            element={
                                auth.user.role === 'admin' ? (
                                    <AdminDashboard currentUserId={auth.user.id} />
                                ) : (
                                    <RoleRedirect role={auth.user.role} />
                                )
                            }
                        />
                        <Route
                            path="/dashboard/teacher"
                            element={
                                auth.user.role === 'teacher' ? (
                                    <TeacherDashboard />
                                ) : (
                                    <RoleRedirect role={auth.user.role} />
                                )
                            }
                        />
                        <Route
                            path="/dashboard/student"
                            element={
                                auth.user.role === 'student' ? (
                                    <StudentDashboard onUnreadCountChange={setUnreadCount} />
                                ) : (
                                    <RoleRedirect role={auth.user.role} />
                                )
                            }
                        />
                        <Route
                            path="/dashboard/courses/:courseId"
                            element={
                                auth.user.role === 'student' ? (
                                    <CourseDetailsPage />
                                ) : (
                                    <RoleRedirect role={auth.user.role} />
                                )
                            }
                        />
                        <Route path="*" element={<RoleRedirect role={auth.user.role} />} />
                    </Routes>
                </AppShell>
            </BrowserRouter>
        </>
    );
}
