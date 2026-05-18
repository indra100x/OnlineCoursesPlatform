import { type FormEvent, useDeferredValue, useEffect, useEffectEvent, useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import api from '@/lib/api';
import { EmptyState } from '@/components/platform/empty-state';
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
        <div className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-3">
                <div className="brand-surface p-5">
                    <p className="brand-kicker">Total users</p>
                    <p className="mt-2 text-3xl font-black text-black">{users.length}</p>
                    <p className="mt-1 text-sm text-black/50">All accounts on the platform</p>
                </div>
                <div className="brand-surface-blue p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Teachers</p>
                    <p className="mt-2 text-3xl font-black text-white">{teachersCount}</p>
                    <p className="mt-1 text-sm text-white/65">Course creators and publishers</p>
                </div>
                <div className="brand-surface-accent p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">Students</p>
                    <p className="mt-2 text-3xl font-black text-black">{studentsCount}</p>
                    <p className="mt-1 text-sm text-black/55">Enrolled learners</p>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[380px,1fr]">
                <div className="brand-surface p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-black text-white">
                            {editingUser ? <Pencil className="size-4" /> : <Plus className="size-4" />}
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-black">
                                {editingUser ? 'Update user' : 'Create user'}
                            </h2>
                            <p className="text-xs text-black/50">
                                Only teachers and students can be created here.
                            </p>
                        </div>
                    </div>

                    <form className="mt-5 space-y-3.5" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                placeholder={editingUser ? 'Leave blank to keep current' : 'Temporary password'}
                                required={!editingUser}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="role" className="text-xs font-semibold">Role</Label>
                            <select
                                id="role"
                                className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
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

                        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}

                        <div className="flex gap-2">
                            <Button type="submit" className="rounded-xl bg-black text-white hover:bg-black/90" disabled={submitting}>
                                {editingUser ? 'Update user' : 'Create user'}
                            </Button>
                            {editingUser ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
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

                <div className="brand-surface p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-black">User directory</h2>
                            <p className="text-xs text-black/50">Search, update, and retire access from one place.</p>
                        </div>
                        <div className="w-full sm:w-60">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name, role, or email"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        {loading ? (
                            <p className="text-sm text-black/45">Loading users...</p>
                        ) : filteredUsers.length === 0 ? (
                            <EmptyState title="No users yet" description="Create the first teacher or student account to get started." />
                        ) : (
                            <div className="space-y-2">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-3 rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4 sm:flex-row sm:items-center sm:justify-between hover:border-black/15 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-[1rem] bg-black text-white">
                                                <Users className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-black">{user.name}</p>
                                                <p className="text-xs text-black/50">{user.email}</p>
                                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                                                    {user.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" className="rounded-[0.8rem]" onClick={() => startEdit(user)}>
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="rounded-[0.8rem]"
                                                onClick={() => void handleDelete(user)}
                                                disabled={user.id === currentUserId}
                                            >
                                                <Trash2 className="size-3.5" />
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
