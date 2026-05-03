import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, BookOpen, GraduationCap, LayoutDashboard, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types/platform';

type ShellUser = {
    name: string;
    email: string;
    role: Role;
    avatar_path?: string | null;
};

type AppShellProps = PropsWithChildren<{
    user: ShellUser;
    unreadCount: number;
    csrfToken: string;
}>;

const navByRole: Record<Role, { label: string; to: string; icon: typeof LayoutDashboard }[]> = {
    admin: [
        { label: 'Admin Dashboard', to: '/dashboard/admin', icon: ShieldCheck },
        { label: 'Profile', to: '/dashboard/profile', icon: UserCircle2 },
    ],
    teacher: [
        { label: 'Teacher Dashboard', to: '/dashboard/teacher', icon: BookOpen },
        { label: 'Profile', to: '/dashboard/profile', icon: UserCircle2 },
    ],
    student: [
        { label: 'Student Dashboard', to: '/dashboard/student', icon: GraduationCap },
        { label: 'Notifications', to: '/dashboard/student?tab=notifications', icon: Bell },
        { label: 'Profile', to: '/dashboard/profile', icon: UserCircle2 },
    ],
};

export function AppShell({ children, user, unreadCount, csrfToken }: AppShellProps) {
    const location = useLocation();
    const avatarUrl = user.avatar_path ? `/storage/${user.avatar_path}` : null;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fde68a_0%,rgba(253,230,138,0.15)_18%,transparent_38%),radial-gradient(circle_at_top_right,#a7f3d0_0%,rgba(167,243,208,0.22)_16%,transparent_34%),linear-gradient(160deg,#0f172a_0%,#164e63_38%,#f8fafc_100%)] text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 lg:px-8">
                <header className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.75)] backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,rgba(250,204,21,0.22),rgba(45,212,191,0.18),rgba(251,146,60,0.18))]" />
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-lg">
                                <LayoutDashboard className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                                    Online Courses Platform
                                </p>
                                <h1 className="text-2xl font-semibold text-white">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)} workspace
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3 rounded-2xl bg-white/14 px-4 py-3 text-white ring-1 ring-white/15">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={user.name} className="size-11 rounded-2xl object-cover" />
                                ) : (
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 text-sm font-semibold">
                                        {user.name.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-slate-200">{user.email}</p>
                                </div>
                            </div>
                            <form method="POST" action="/logout">
                                <input type="hidden" name="_token" value={csrfToken} />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                                >
                                    <LogOut className="size-4" />
                                    Sign out
                                </Button>
                            </form>
                        </div>
                    </div>

                    <nav className="mt-4 flex flex-wrap gap-3">
                        {navByRole[user.role].map((item) => {
                            const [pathOnly] = item.to.split('?');
                            const isNotifications = item.to.includes('tab=notifications');
                            const isActive = isNotifications
                                ? location.pathname === '/dashboard/student' && location.search.includes('tab=notifications')
                                : location.pathname === pathOnly;

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-white text-slate-950 shadow-lg'
                                            : 'bg-white/10 text-white hover:bg-white/20'
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
