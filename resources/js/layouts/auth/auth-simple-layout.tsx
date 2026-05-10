import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-[#fbf7ef] px-6 py-8 md:px-10">
            <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-[0_30px_90px_rgba(17,17,17,0.1)] lg:grid-cols-[1.08fr,0.92fr]">
                <div className="brand-grid relative hidden overflow-hidden bg-[#fff6d0] p-10 lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute left-10 top-16 h-28 w-28 rounded-[2rem] bg-[#ef4444]" />
                    <div className="absolute right-20 top-24 h-24 w-24 rounded-full bg-[#2563eb]" />
                    <div className="absolute bottom-16 right-12 h-36 w-36 rounded-[2.5rem] bg-black" />
                    <div className="relative z-10 max-w-xl">
                        <Link href={home()} className="inline-flex items-center gap-3 font-medium">
                            <AppLogo />
                        </Link>
                        <div className="mt-16 space-y-6">
                            <span className="brand-pill bg-white/85 text-black">Admin Managed Access</span>
                            <h1 className="max-w-lg text-5xl font-black leading-[1.05] text-black">
                                Learn in a workspace that feels polished from the first click.
                            </h1>
                            <p className="max-w-md text-base leading-7 text-black/68">
                                Teachers publish structured courses, students unlock learning with guided access, and every dashboard stays crisp and focused.
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 grid max-w-xl grid-cols-3 gap-4">
                        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_20px_40px_rgba(17,17,17,0.08)]">
                            <div className="h-20 rounded-[1.25rem] bg-[#ffd84d]" />
                            <p className="mt-4 text-sm font-semibold text-black">Course access</p>
                        </div>
                        <div className="rounded-[1.75rem] bg-black p-5 text-white shadow-[0_20px_40px_rgba(17,17,17,0.12)]">
                            <div className="h-20 rounded-[1.25rem] bg-[#2563eb]" />
                            <p className="mt-4 text-sm font-semibold">Teacher tools</p>
                        </div>
                        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_20px_40px_rgba(17,17,17,0.08)]">
                            <div className="h-20 rounded-[1.25rem] bg-[#ef4444]" />
                            <p className="mt-4 text-sm font-semibold text-black">Student flow</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center bg-white p-6 md:p-10">
                    <div className="w-full max-w-md">
                        <div className="brand-surface-dark relative overflow-hidden p-8 md:p-10">
                            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#2563eb]" />
                            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-tr-[2rem] bg-[#ef4444]" />
                            <div className="relative z-10 flex flex-col gap-8">
                                <div className="flex flex-col items-start gap-4">
                                    <Link href={home()} className="font-medium lg:hidden [&_span:first-child]:text-white [&_span:last-child]:text-white/65">
                                        <AppLogo />
                                    </Link>

                                    <div className="space-y-2">
                                        <span className="brand-pill border-white/15 bg-white/8 text-white">Secure sign in</span>
                                        <h1 className="text-3xl font-black leading-tight text-white">{title}</h1>
                                        <p className="text-sm leading-6 text-white/70">{description}</p>
                                    </div>
                                </div>
                                <div className="auth-on-dark">{children}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
