import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, BookOpen, GraduationCap, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types/platform';

type ShellUser = {
    name: string;
    email: string;
    role: Role;
};

type AppShellProps = PropsWithChildren<{
    user: ShellUser;
    unreadCount: number;
    onLogout: () => Promise<void>;
}>;

const navByRole: Record<Role, { label: string; to: string; icon: typeof LayoutDashboard }[]> = {
    admin: [
        { label: 'Admin Dashboard', to: '/dashboard/admin', icon: ShieldCheck },
    ],
    teacher: [
        { label: 'Teacher Dashboard', to: '/dashboard/teacher', icon: BookOpen },
    ],
    student: [
        { label: 'Student Dashboard', to: '/dashboard/student', icon: GraduationCap },
        { label: 'Notifications', to: '/dashboard/student?tab=notifications', icon: Bell },
    ],
};

export function AppShell({ children, user, unreadCount, onLogout }: AppShellProps) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[linear-gradient(140deg,#f8fafc_0%,#e0f2fe_35%,#fef3c7_100%)] text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 lg:px-8">
                <header className="rounded-[2rem] border border-white/60 bg-white/75 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                <LayoutDashboard className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                                    Online Courses Platform
                                </p>
                                <h1 className="text-2xl font-semibold text-slate-950">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} workspace
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-slate-300">{user.email}</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-2xl border-slate-300 bg-white"
                                onClick={() => void onLogout()}
                            >
                                <LogOut className="size-4" />
                                Sign out
                            </Button>
                        </div>
                    </div>

                    <nav className="mt-4 flex flex-wrap gap-3">
                        {navByRole[user.role].map((item) => {
                            const isActive =
                                location.pathname === item.to ||
                                (item.to.includes('?tab=notifications') &&
                                    location.pathname === '/dashboard/student');

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-slate-950 text-white'
                                            : 'bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <item.icon className="size-4" />
                                    {item.label}
                                    {item.label === 'Notifications' && unreadCount > 0 ? (
                                        <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-semibold text-slate-900">
                                            {unreadCount}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>
                </header>

                <main className="mt-6 flex-1">{children}</main>
            </div>
        </div>
    );
}
