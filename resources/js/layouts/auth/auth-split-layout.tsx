import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid min-h-dvh bg-[#fbf7ef] px-8 py-8 lg:max-w-none lg:grid-cols-2 lg:px-10">
            <div className="brand-grid relative hidden h-full flex-col justify-between overflow-hidden rounded-l-[2.5rem] bg-[#fff6d0] p-10 lg:flex">
                <div className="absolute top-12 -left-10 h-40 w-40 rounded-full bg-[#2563eb]/15" />
                <div className="absolute right-10 bottom-10 h-40 w-40 rounded-[3rem] bg-black" />
                <div className="absolute top-20 right-24 h-24 w-24 rounded-[2rem] bg-[#ef4444]" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-medium"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black">
                        <AppLogoIcon className="size-8" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-black">{name}</p>
                        <p className="text-xs font-medium tracking-[0.2em] text-black/45 uppercase">
                            Learning Platform
                        </p>
                    </div>
                </Link>
                <div className="relative z-20 max-w-xl space-y-6">
                    <span className="brand-pill bg-white/85 text-black">
                        Modern course platform
                    </span>
                    <h2 className="text-5xl leading-[1.05] font-black text-black">
                        Bright content, serious structure, zero visual clutter.
                    </h2>
                    <p className="max-w-lg text-base leading-7 text-black/65">
                        A clean white foundation, dark anchors, and bold color
                        accents keep the experience confident across login,
                        teaching, and study flows.
                    </p>
                </div>
                <div className="relative z-20 grid max-w-xl grid-cols-3 gap-4">
                    <div className="rounded-[1.6rem] bg-white p-4 shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
                        <p className="text-xs font-semibold tracking-[0.22em] text-black/45 uppercase">
                            Visuals
                        </p>
                        <p className="mt-3 text-xl font-black text-black">
                            Commercial
                        </p>
                    </div>
                    <div className="rounded-[1.6rem] bg-black p-4 text-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]">
                        <p className="text-xs font-semibold tracking-[0.22em] text-white/45 uppercase">
                            Access
                        </p>
                        <p className="mt-3 text-xl font-black">Secure</p>
                    </div>
                    <div className="rounded-[1.6rem] bg-[#2563eb] p-4 text-white shadow-[0_18px_40px_rgba(37,99,235,0.15)]">
                        <p className="text-xs font-semibold tracking-[0.22em] text-white/55 uppercase">
                            Flow
                        </p>
                        <p className="mt-3 text-xl font-black">Guided</p>
                    </div>
                </div>
            </div>
            <div className="flex w-full items-center justify-center rounded-r-[2.5rem] bg-white p-6 lg:p-8">
                <div className="brand-surface-dark mx-auto flex w-full max-w-md flex-col justify-center space-y-6 p-8 sm:w-[380px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <span className="brand-pill border-white/15 bg-white/8 text-white">
                            Secure login
                        </span>
                        <h1 className="text-xl font-medium text-white">
                            {title}
                        </h1>
                        <p className="text-sm text-balance text-white/70">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
