import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, BookOpen, GraduationCap, LogOut, ShieldCheck, UserCircle2, type LucideIcon } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
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

const navByRole: Record<Role, { label: string; to: string; icon: LucideIcon }[]> = {
    admin: [
        { label: 'Dashboard', to: '/dashboard/admin', icon: ShieldCheck },
        { label: 'Profile', to: '/dashboard/profile', icon: UserCircle2 },
    ],
    teacher: [
        { label: 'Dashboard', to: '/dashboard/teacher', icon: BookOpen },
        { label: 'Profile', to: '/dashboard/profile', icon: UserCircle2 },
    ],
    student: [
        { label: 'Dashboard', to: '/dashboard/student', icon: GraduationCap },
        { label: 'Notifications', to: '/dashboard/student?tab=notifications', icon: Bell },
        { label: 'Profile', to: '/dashboard/profile', icon: UserCircle2 },
    ],
};

export function AppShell({ children, user, unreadCount, csrfToken }: AppShellProps) {
    const location = useLocation();
    const avatarUrl = user.avatar_path ? `/storage/${user.avatar_path}` : null;

    return (
        <div className="min-h-screen bg-[#fbf7ef] text-black">
            <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 lg:px-6">
                <header className="relative rounded-[1.75rem] border border-black/8 bg-white shadow-[0_4px_24px_rgba(17,17,17,0.04)]">
                    <div className="flex flex-col gap-3 p-4 lg:p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-[1.15rem] bg-black text-white shadow-sm">
                                    <AppLogoIcon className="size-7" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">
                                        CourseAtlas LMS
                                    </p>
                                    <h1 className="text-lg font-bold text-black">
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)} workspace
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2.5 rounded-[1.2rem] bg-[#fbf7ef] border border-black/6 px-3.5 py-2">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={user.name} className="size-8 rounded-[0.9rem] object-cover" />
                                    ) : (
                                        <div className="flex size-8 items-center justify-center rounded-[0.9rem] bg-[#ffd84d] text-xs font-bold text-black">
                                            {user.name.slice(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium leading-tight text-black">{user.name}</p>
                                        <p className="text-[11px] text-black/45">{user.email}</p>
                                    </div>
                                </div>
                                <form method="POST" action="/logout">
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-[1rem] border-black/10 text-black hover:bg-[#fff6d0]"
                                    >
                                        <LogOut className="size-3.5" />
                                        <span className="hidden sm:inline">Sign out</span>
                                    </Button>
                                </form>
                            </div>
                        </div>

                        <nav className="flex flex-wrap gap-2">
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
                                        className={`inline-flex items-center gap-1.5 rounded-[0.9rem] px-3.5 py-1.5 text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-black text-white shadow-sm'
                                                : 'text-black/60 hover:bg-black/5 hover:text-black'
                                        }`}
                                    >
                                        <item.icon className="size-4" />
                                        {item.label}
                                        {item.label === 'Notifications' && unreadCount > 0 ? (
                                            <span className="ml-0.5 rounded-full bg-[#ef4444] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                {unreadCount}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </header>

                <main className="mt-5">{children}</main>
            </div>
        </div>
    );
}
