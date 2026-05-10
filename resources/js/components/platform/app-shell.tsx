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
    const workspaceTitle = `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} workspace`;

    return (
        <div className="min-h-screen bg-[#fbf7ef] text-black">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 lg:px-8">
                <header className="brand-surface-dark relative overflow-hidden p-5">
                    <div className="pointer-events-none absolute -left-14 top-10 h-28 w-28 rounded-full bg-[#ffd84d]" />
                    <div className="pointer-events-none absolute right-24 top-0 h-24 w-24 rounded-b-[2rem] bg-[#2563eb]" />
                    <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 rounded-tl-[2rem] bg-[#ef4444]" />
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-14 items-center justify-center rounded-[1.35rem] bg-white text-black shadow-[0_14px_35px_rgba(17,17,17,0.18)]">
                                <AppLogoIcon className="size-10" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
                                    CourseAtlas LMS
                                </p>
                                <h1 className="text-2xl font-black text-white">{workspaceTitle}</h1>
                                <p className="mt-1 text-sm text-white/65">Structured courses, modern tools, and a cleaner daily workflow.</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur-sm">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={user.name} className="size-11 rounded-[1.2rem] object-cover" />
                                ) : (
                                    <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-[#ffd84d] text-sm font-semibold text-black">
                                        {user.name.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-white/60">{user.email}</p>
                                </div>
                            </div>
                            <form method="POST" action="/logout">
                                <input type="hidden" name="_token" value={csrfToken} />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="rounded-[1.2rem] border-white/15 bg-white text-black hover:bg-[#fff6d0]"
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
                                            ? 'bg-[#ffd84d] text-black shadow-[0_10px_24px_rgba(255,216,77,0.26)]'
                                            : 'border border-white/10 bg-white/8 text-white hover:border-white/25 hover:bg-white/12'
                                    }`}
                                >
                                    <item.icon className="size-4" />
                                    {item.label}
                                    {item.label === 'Notifications' && unreadCount > 0 ? (
                                        <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-xs font-semibold text-white">
                                            {unreadCount}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Platform mode</p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-white">Commercial learning operations</h2>
                                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                                        Stronger hierarchy, brighter accents, and sharper role-based workflows across every page.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="brand-tag-yellow">Premium UI</span>
                                    <span className="brand-tag-blue">Role based</span>
                                    <span className="brand-tag-red">Live data</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            <div className="rounded-[1.6rem] bg-white px-4 py-5 text-black">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">Role</p>
                                <p className="mt-3 text-2xl font-black capitalize">{user.role}</p>
                            </div>
                            <div className="rounded-[1.6rem] bg-[#ffd84d] px-4 py-5 text-black">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/55">Unread</p>
                                <p className="mt-3 text-2xl font-black">{unreadCount}</p>
                            </div>
                            <div className="rounded-[1.6rem] bg-[#2563eb] px-4 py-5 text-white">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Status</p>
                                <p className="mt-3 text-2xl font-black">Active</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mt-6 flex-1">{children}</main>
            </div>
        </div>
    );
}
