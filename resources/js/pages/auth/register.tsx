import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function Register() {
    return (
        <>
            <Head title="Student registration" />

            <Form action="/register" method="post" resetOnSuccess={['password', 'password_confirmation']} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    placeholder="Your full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Create a password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="rounded-xl bg-[#fff6d0] px-4 py-3 text-sm text-black/70">
                                New registrations are created as <span className="font-semibold text-black">student</span> accounts.
                            </div>

                            <Button type="submit" className="h-11 w-full rounded-xl bg-black text-white hover:bg-black/90" disabled={processing}>
                                {processing && <Spinner />}
                                Create student account
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <p className="mt-4 text-center text-sm text-black/55">
                Already have an account? <TextLink href="/login">Log in</TextLink>
            </p>
        </>
    );
}

Register.layout = {
    title: 'Create your student account',
    description: 'Register as a student to browse the catalog, buy courses, and enroll with your unlocked code.',
};
