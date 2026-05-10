import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

export default function VerifyEmail() {
    return (
        <>
            <Head title="Email verification disabled" />
            <div className="space-y-4 text-center">
                <p className="text-sm text-black/55">
                    Email verification is not enabled for this project flow.
                </p>
                <TextLink href={login()}>Back to login</TextLink>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Email verification disabled',
    description: 'Users log in with admin-created accounts.',
};
