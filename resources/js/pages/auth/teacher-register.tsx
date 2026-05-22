import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import {  useState } from 'react';
import type {FormEvent} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

export default function TeacherRegister() {
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', bio: '', proof_link: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            setSubmitting(false);

            return;
        }

        try {
            const response = await api.post('/teacher-requests', {
                name: form.name,
                email: form.email,
                password: form.password,
                bio: form.bio || undefined,
                proof_link: form.proof_link || undefined,
            });
            setSuccess(response.data.message);
            setForm({ name: '', email: '', password: '', password_confirmation: '', bio: '', proof_link: '' });
        } catch (submitError: any) {
            setError(submitError?.response?.data?.message ?? 'Unable to submit your request.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <Head title="Teacher registration" />

            {success ? (
                <div className="space-y-4">
                    <div className="rounded-xl bg-green-50 px-4 py-5 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100">
                            <GraduationCap className="size-6 text-green-600" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-green-800">Request submitted!</p>
                        <p className="mt-1 text-sm text-green-700">{success}</p>
                    </div>
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-black/60 hover:text-black">
                        <ArrowLeft className="size-3.5" />
                        Back to login
                    </Link>
                </div>
            ) : (
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="grid gap-5">
                        <div className="grid gap-1.5">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={form.name}
                                onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))}
                                required
                                autoFocus
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
                                required
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(event) => setForm((c) => ({ ...c, password: event.target.value }))}
                                required
                                placeholder="Create a password"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={form.password_confirmation}
                                onChange={(event) => setForm((c) => ({ ...c, password_confirmation: event.target.value }))}
                                required
                                placeholder="Confirm password"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="bio">Bio <span className="text-black/40">(optional)</span></Label>
                            <textarea
                                id="bio"
                                className="min-h-24 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/30 outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
                                value={form.bio}
                                onChange={(event) => setForm((c) => ({ ...c, bio: event.target.value }))}
                                placeholder="Tell us about your teaching experience..."
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="proof_link">
                                Proof of teaching <span className="text-black/40">(optional)</span>
                            </Label>
                            <Input
                                id="proof_link"
                                type="url"
                                value={form.proof_link}
                                onChange={(event) => setForm((c) => ({ ...c, proof_link: event.target.value }))}
                                placeholder="Link to certificate, portfolio, or credential"
                            />
                            <p className="text-xs text-black/45">
                                Link to a certificate, teaching portfolio, or any document that demonstrates your qualifications.
                            </p>
                        </div>

                        <div className="rounded-xl bg-[#fff6d0] px-4 py-3 text-sm text-black/70">
                            Your registration will be reviewed by an admin. You will receive access once approved.
                        </div>

                        {error ? (
                            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
                        ) : null}

                        <Button type="submit" className="h-11 w-full rounded-xl bg-black text-white hover:bg-black/90" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit teacher request'}
                        </Button>
                    </div>
                </form>
            )}

            <p className="mt-4 text-center text-sm text-black/55">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-black underline-offset-2 hover:underline">Log in</Link>
                {' · '}
                <Link href="/register" className="font-semibold text-black underline-offset-2 hover:underline">Register</Link>
            </p>
        </>
    );
}

TeacherRegister.layout = {
    title: 'Register as a teacher',
    description: 'Submit your request to become a teacher. An admin will review and approve your account.',
};
