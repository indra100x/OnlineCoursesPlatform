import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-[#fbf7ef] px-4 py-5 md:px-8 md:py-8">
            <div className="mx-auto grid min-h-[calc(100svh-2.5rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_20px_80px_rgba(17,17,17,0.08)] lg:grid-cols-[1.1fr,0.9fr]">
                <div className="brand-gradient-overlay relative hidden overflow-hidden bg-[#fff6d0] p-10 lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute top-12 -left-8 h-32 w-32 rounded-[2.5rem] bg-[#ef4444]/90" />
                    <div className="absolute top-20 right-16 h-28 w-28 rounded-full bg-[#2563eb]/90" />
                    <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-[3rem] bg-black" />
                    <div className="absolute top-1/3 left-1/3 h-16 w-16 rounded-full bg-[#ffd84d]/70" />

                    <div className="relative z-10 max-w-xl">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 font-medium"
                        >
                            <AppLogo />
                        </Link>
                        <div className="mt-14 space-y-5">
                            <span className="brand-pill bg-white/90 text-black shadow-sm">
                                Admin Managed Access
                            </span>
                            <h1 className="max-w-lg text-5xl leading-[1.05] font-black tracking-[-0.03em] text-black">
                                Learn in a workspace that feels polished from
                                the first click.
                            </h1>
                            <p className="max-w-md text-base leading-7 text-black/65">
                                Teachers publish structured courses, students
                                unlock learning with guided access, and every
                                dashboard stays crisp and focused.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 grid max-w-xl grid-cols-3 gap-4">
                        <div className="brand-surface p-5">
                            <div className="flex h-20 items-center justify-center rounded-[1.25rem] bg-[#ffd84d]">
                                <span className="text-2xl">📚</span>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-black">
                                Course access
                            </p>
                        </div>
                        <div className="brand-surface-dark p-5">
                            <div className="flex h-20 items-center justify-center rounded-[1.25rem] bg-[#2563eb]">
                                <span className="text-2xl">🛠️</span>
                            </div>
                            <p className="mt-4 text-sm font-semibold">
                                Teacher tools
                            </p>
                        </div>
                        <div className="brand-surface p-5">
                            <div className="flex h-20 items-center justify-center rounded-[1.25rem] bg-[#ef4444]">
                                <span className="text-2xl">🎓</span>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-black">
                                Student flow
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center bg-white p-6 md:p-8">
                    <div className="w-full max-w-sm">
                        <div className="space-y-6">
                            <div className="flex flex-col items-start gap-4">
                                <Link
                                    href={home()}
                                    className="font-medium lg:hidden"
                                >
                                    <AppLogo />
                                </Link>

                                <div className="space-y-2">
                                    <span className="brand-pill border-black/8 bg-[#fff6d0] text-black">
                                        Secure sign in
                                    </span>
                                    <h1 className="text-3xl leading-tight font-black tracking-[-0.02em] text-black">
                                        {title}
                                    </h1>
                                    <p className="text-sm leading-6 text-black/55">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-[1.5rem] border border-black/6 bg-[#fbf7ef] p-6 shadow-sm md:p-7">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
