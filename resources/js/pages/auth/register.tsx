import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Registration disabled" />
            <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                    Public registration is disabled for this platform.
                </p>
                <TextLink href={login()}>Return to login</TextLink>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Registration disabled',
    description: 'Accounts are created only by the platform administrator.',
};
