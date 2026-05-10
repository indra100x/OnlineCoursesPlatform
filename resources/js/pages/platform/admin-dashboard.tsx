import { type FormEvent, useDeferredValue, useEffect, useEffectEvent, useState } from 'react';
import { Trash2, UserCog, Users } from 'lucide-react';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
import { StatsCard } from '@/components/platform/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlatformUser, Role } from '@/types/platform';

type AdminDashboardProps = {
    currentUserId: number;
};

type UserFormState = {
    name: string;
    email: string;
    password: string;
    role: Exclude<Role, 'admin'>;
};

const initialForm: UserFormState = {
    name: '',
    email: '',
    password: '',
    role: 'teacher',
};

export default function AdminDashboard({ currentUserId }: AdminDashboardProps) {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [form, setForm] = useState<UserFormState>(initialForm);
    const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useEffectEvent(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get<{ users: PlatformUser[] }>('/users');
            setUsers(response.data.users);
        } catch {
            setError('Unable to load users right now.');
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void loadUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase();
        return haystack.includes(deferredSearch.toLowerCase());
    });

    const teachersCount = users.filter((user) => user.role === 'teacher').length;
    const studentsCount = users.filter((user) => user.role === 'student').length;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, {
                    name: form.name,
                    email: form.email,
                    password: form.password || undefined,
                    role: form.role,
                });
            } else {
                await api.post('/users', form);
            }

            setForm(initialForm);
            setEditingUser(null);
            await loadUsers();
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to save this user.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(user: PlatformUser) {
        if (!window.confirm(`Delete ${user.name}?`)) {
            return;
        }

        try {
            await api.delete(`/users/${user.id}`);
            await loadUsers();
        } catch (deleteError: any) {
            setError(deleteError?.response?.data?.message ?? 'Unable to delete this user.');
        }
    }

    function startEdit(user: PlatformUser) {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role === 'student' ? 'student' : 'teacher',
        });
    }

    return (
        <div className="space-y-6">
            <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
                <div className="brand-surface-dark relative overflow-hidden p-7">
                    <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-[#ffd84d]" />
                    <div className="absolute right-6 top-0 h-20 w-20 rounded-b-[1.8rem] bg-[#2563eb]" />
                    <div className="relative z-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Admin command</p>
                        <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">Control access with clarity.</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
                            Create managed accounts, keep the directory clean, and shape a more professional learning environment from one control surface.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-1">
                    <div className="brand-surface-soft p-5">
                        <p className="brand-kicker">Access model</p>
                        <p className="mt-3 text-2xl font-black text-black">No public registration</p>
                    </div>
                    <div className="rounded-[2rem] bg-[#ffd84d] p-5 text-black shadow-[0_18px_44px_rgba(255,216,77,0.18)]">
                        <p className="brand-kicker text-black/55">Operational note</p>
                        <p className="mt-3 text-2xl font-black">Invite intentionally, not openly.</p>
                    </div>
                    <div className="brand-surface-soft p-5">
                        <p className="brand-kicker">Directory state</p>
                        <p className="mt-3 text-2xl font-black text-black">{filteredUsers.length} visible users</p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <StatsCard label="Users" value={users.length} hint="Every teacher and student account lives here." />
                <StatsCard label="Teachers" value={teachersCount} hint="Teachers can create courses and chapters." />
                <StatsCard label="Students" value={studentsCount} hint="Students only log in and enroll by code." />
            </section>

            <section className="grid gap-6 xl:grid-cols-[360px,1fr]">
                <div className="brand-surface p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                            <UserCog className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-black">
                                {editingUser ? 'Update user' : 'Create user'}
                            </h2>
                            <p className="text-sm text-black/60">
                                Only teachers and students can be created here.
                            </p>
                        </div>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                placeholder={editingUser ? 'Leave blank to keep current password' : 'Temporary password'}
                                required={!editingUser}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                className="flex h-10 w-full rounded-xl border border-black/15 bg-white px-3 py-1 text-sm text-black outline-none focus:border-[#2563eb]"
                                value={form.role}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        role: event.target.value as UserFormState['role'],
                                    }))
                                }
                            >
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                            </select>
                        </div>

                        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

                        <div className="flex gap-3">
                            <Button type="submit" className="rounded-2xl bg-black text-white" disabled={submitting}>
                                {editingUser ? 'Update user' : 'Create user'}
                            </Button>
                            {editingUser ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-2xl"
                                    onClick={() => {
                                        setEditingUser(null);
                                        setForm(initialForm);
                                    }}
                                >
                                    Cancel
                                </Button>
                            ) : null}
                        </div>
                    </form>
                </div>

                <div className="brand-surface p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-black">User directory</h2>
                            <p className="text-sm text-black/60">Search, update, and retire access from one place.</p>
                        </div>
                        <div className="w-full sm:w-72">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name, role, or email"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        {loading ? (
                            <p className="text-sm text-gray-400">Loading users...</p>
                        ) : filteredUsers.length === 0 ? (
                            <EmptyState title="No users yet" description="Create the first teacher or student account to get started." />
                        ) : (
                            <div className="space-y-3">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-4 rounded-[1.75rem] border border-black/10 bg-[#fffdf7] p-4 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-11 items-center justify-center rounded-2xl bg-black text-white">
                                                <Users className="size-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-black">{user.name}</p>
                                                <p className="text-sm text-black/55">{user.email}</p>
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                                                    {user.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button type="button" variant="outline" className="rounded-2xl" onClick={() => startEdit(user)}>
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="rounded-2xl"
                                                onClick={() => void handleDelete(user)}
                                                disabled={user.id === currentUserId}
                                            >
                                                <Trash2 className="size-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
