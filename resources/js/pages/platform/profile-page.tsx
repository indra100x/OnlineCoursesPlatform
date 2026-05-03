import { type FormEvent, useEffect, useEffectEvent, useState } from 'react';
import { Camera, LockKeyhole, UserCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile } from '@/types/platform';

type ProfilePageProps = {
    onProfileRefresh: (profile: Profile) => void;
};

export default function ProfilePage({ onProfileRefresh }: ProfilePageProps) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileForm, setProfileForm] = useState({ name: '', bio: '', avatar: null as File | null });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useEffectEvent(async () => {
        try {
            const response = await api.get<{ profile: Profile }>('/profile');
            setProfile(response.data.profile);
            setProfileForm((current) => ({
                ...current,
                name: response.data.profile.name,
                bio: response.data.profile.bio ?? '',
            }));
        } catch {
            setError('Unable to load your profile.');
        }
    });

    useEffect(() => {
        void loadProfile();
    }, []);

    async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setMessage(null);

        const payload = new FormData();
        payload.append('name', profileForm.name);
        payload.append('bio', profileForm.bio);

        if (profileForm.avatar) {
            payload.append('avatar', profileForm.avatar);
        }

        try {
            const response = await api.post<{ message: string; profile: Profile }>('/profile', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProfile(response.data.profile);
            setMessage(response.data.message);
            onProfileRefresh(response.data.profile);
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to update your profile.');
        }
    }

    async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setMessage(null);

        try {
            const response = await api.post<{ message: string }>('/profile/password', passwordForm);
            setPasswordForm({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
            setMessage(response.data.message);
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to update your password.');
        }
    }

    const avatarUrl = profile?.avatar_path ? `/storage/${profile.avatar_path}` : null;

    return (
        <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
            <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.85)] backdrop-blur-xl">
                <div className="flex flex-col items-center text-center">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={profile?.name ?? 'Profile'} className="size-28 rounded-[2rem] object-cover shadow-2xl" />
                    ) : (
                        <div className="flex size-28 items-center justify-center rounded-[2rem] bg-white/15">
                            <UserCircle2 className="size-14" />
                        </div>
                    )}
                    <h1 className="mt-5 text-2xl font-semibold">{profile?.name ?? 'Profile'}</h1>
                    <p className="mt-1 text-sm text-slate-200">{profile?.email}</p>
                    <p className="mt-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                        {profile?.role ?? 'member'}
                    </p>
                    <p className="mt-5 text-sm text-slate-200">
                        {profile?.bio || 'Add a short bio so your dashboard feels more personal and complete.'}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center gap-3">
                        <Camera className="size-5 text-teal-700" />
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">Profile details</h2>
                            <p className="text-sm text-slate-600">Update your display name, bio, and profile photo.</p>
                        </div>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleProfileSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="profile-name">Name</Label>
                            <Input
                                id="profile-name"
                                value={profileForm.name}
                                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-bio">Bio</Label>
                            <textarea
                                id="profile-bio"
                                className="min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                value={profileForm.bio}
                                onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                                placeholder="Tell students or collaborators a bit about yourself."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-avatar">Profile photo</Label>
                            <Input
                                id="profile-avatar"
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setProfileForm((current) => ({ ...current, avatar: event.target.files?.[0] ?? null }))
                                }
                            />
                        </div>
                        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
                        {error ? <p className="text-sm text-red-600">{error}</p> : null}
                        <Button type="submit" className="rounded-2xl bg-teal-600 text-white hover:bg-teal-700">
                            Save profile
                        </Button>
                    </form>
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
                    <div className="flex items-center gap-3">
                        <LockKeyhole className="size-5 text-amber-700" />
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">Security</h2>
                            <p className="text-sm text-slate-600">Change your password without leaving the dashboard.</p>
                        </div>
                    </div>

                    <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handlePasswordSubmit}>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="current-password">Current password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={passwordForm.current_password}
                                onChange={(event) =>
                                    setPasswordForm((current) => ({
                                        ...current,
                                        current_password: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={passwordForm.password}
                                onChange={(event) =>
                                    setPasswordForm((current) => ({ ...current, password: event.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwordForm.password_confirmation}
                                onChange={(event) =>
                                    setPasswordForm((current) => ({
                                        ...current,
                                        password_confirmation: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Button type="submit" className="rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400">
                                Update password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
