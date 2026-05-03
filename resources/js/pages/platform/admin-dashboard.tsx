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
            <section className="grid gap-4 md:grid-cols-3">
                <StatsCard label="Users" value={users.length} hint="Every teacher and student account lives here." />
                <StatsCard label="Teachers" value={teachersCount} hint="Teachers can create courses and chapters." />
                <StatsCard label="Students" value={studentsCount} hint="Students only log in and enroll by code." />
            </section>

            <section className="grid gap-6 xl:grid-cols-[360px,1fr]">
                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center gap-3">
                        <UserCog className="size-5 text-sky-700" />
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">
                                {editingUser ? 'Update user' : 'Create user'}
                            </h2>
                            <p className="text-sm text-slate-600">
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
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
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

                        {error ? <p className="text-sm text-red-600">{error}</p> : null}

                        <div className="flex gap-3">
                            <Button type="submit" className="rounded-2xl" disabled={submitting}>
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

                <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">User directory</h2>
                            <p className="text-sm text-slate-600">Search, update, and retire access from one place.</p>
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
                            <p className="text-sm text-slate-500">Loading users...</p>
                        ) : filteredUsers.length === 0 ? (
                            <EmptyState title="No users yet" description="Create the first teacher or student account to get started." />
                        ) : (
                            <div className="space-y-3">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 lg:flex-row lg:items-center lg:justify-between"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                                <Users className="size-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{user.name}</p>
                                                <p className="text-sm text-slate-600">{user.email}</p>
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
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
