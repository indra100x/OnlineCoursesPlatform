import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#fbf7ef] p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black">
                        <AppLogoIcon className="size-8" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-[2rem] border-black bg-black text-white shadow-[0_28px_70px_rgba(17,17,17,0.18)]">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl text-white">
                                {title}
                            </CardTitle>
                            <CardDescription className="text-white/65">
                                {description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="auth-on-dark px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
