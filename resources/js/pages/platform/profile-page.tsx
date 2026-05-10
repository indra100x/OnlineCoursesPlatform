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
            <div className="brand-surface-dark relative overflow-hidden p-6 text-white">
                <div className="absolute -top-8 right-6 h-24 w-24 rounded-full bg-[#2563eb]" />
                <div className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-[2rem] bg-[#ef4444]" />
                <div className="flex flex-col items-center text-center">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={profile?.name ?? 'Profile'} className="size-28 rounded-[2rem] object-cover shadow-2xl" />
                    ) : (
                        <div className="flex size-28 items-center justify-center rounded-[2rem] bg-white/10">
                            <UserCircle2 className="size-14" />
                        </div>
                    )}
                    <h1 className="mt-5 text-2xl font-semibold">{profile?.name ?? 'Profile'}</h1>
                    <p className="mt-1 text-sm text-white/65">{profile?.email}</p>
                    <p className="mt-2 rounded-full bg-[#ffd84d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black">
                        {profile?.role ?? 'member'}
                    </p>
                    <p className="mt-5 text-sm text-white/70">
                        {profile?.bio || 'Add a short bio so your dashboard feels more personal and complete.'}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="brand-surface p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                            <Camera className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-black">Profile details</h2>
                            <p className="text-sm text-black/60">Update your display name, bio, and profile photo.</p>
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
                                className="min-h-32 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[#2563eb]"
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
                        {message ? <p className="rounded-xl bg-[#fff6d0] px-3 py-2 text-sm text-black">{message}</p> : null}
                        {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
                        <Button type="submit" className="rounded-2xl bg-black text-white hover:bg-black/90">
                            Save profile
                        </Button>
                    </form>
                </div>

                <div className="brand-surface p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563eb] text-white">
                            <LockKeyhole className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-black">Security</h2>
                            <p className="text-sm text-black/60">Change your password without leaving the dashboard.</p>
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
                            <Button type="submit" className="rounded-2xl bg-[#ffd84d] text-black hover:bg-[#facc15]">
                                Update password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
