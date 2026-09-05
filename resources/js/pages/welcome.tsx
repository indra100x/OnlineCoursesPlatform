import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Bell,
    BookOpen,
    Check,
    GraduationCap,
    HeartHandshake,
    Play,
    ShieldCheck,
    Star,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { dashboard, login } from '@/routes';

const categories = [
    { name: 'Computer Science', courses: '48 courses', color: 'bg-[#fff6d0]' },
    { name: 'Business Systems', courses: '31 courses', color: 'bg-[#edf4ff]' },
    { name: 'Design Practice', courses: '26 courses', color: 'bg-[#ffe4e4]' },
    {
        name: 'Teacher Training',
        courses: '19 courses',
        color: 'bg-black text-white',
    },
];

const features = [
    {
        icon: ShieldCheck,
        title: 'Admin-managed access',
        description:
            'No open registration. Accounts are provisioned intentionally for every teacher and student.',
        accent: 'bg-[#ffd84d]',
    },
    {
        icon: BookOpen,
        title: 'Structured course building',
        description:
            'Publish courses with pricing, enrollment codes, chapters, and visible student progress.',
        accent: 'bg-[#2563eb]',
    },
    {
        icon: Bell,
        title: 'Real student notifications',
        description:
            'New chapter releases trigger in-app alerts so learners always know what changed.',
        accent: 'bg-[#ef4444]',
    },
    {
        icon: HeartHandshake,
        title: 'Student-first flow',
        description:
            'Wishlist, beta purchase, rating, and enrollment all happen in one clear experience.',
        accent: 'bg-black',
    },
];

const highlights = [
    { value: '12K+', label: 'student sessions' },
    { value: '640+', label: 'managed cohorts' },
    { value: '94%', label: 'return learners' },
    { value: '4.9/5', label: 'course satisfaction' },
];

const journey = [
    'Admin creates teacher and student accounts',
    'Teacher launches a course and publishes chapters',
    'Student purchases, unlocks the code, and enrolls',
];

const proofCards = [
    {
        title: 'Managed onboarding',
        value: '100%',
        note: 'admin controlled accounts',
        color: 'bg-black text-white',
    },
    {
        title: 'Course conversion',
        value: '32%',
        note: 'wishlist to beta buy flow',
        color: 'bg-[#ffd84d] text-black',
    },
    {
        title: 'Student return rate',
        value: '94%',
        note: 'repeat course engagement',
        color: 'bg-[#2563eb] text-white',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="CourseAtlas | Premium Learning Platform" />

            <div className="min-h-screen bg-[#fbf7ef] text-black">
                <nav className="sticky top-0 z-40 border-b border-black/6 bg-[#fbf7ef]/95 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className="flex items-center"
                        >
                            <AppLogo />
                        </Link>

                        <div className="hidden items-center gap-8 lg:flex">
                            <a
                                href="#features"
                                className="text-sm font-medium text-black/55 transition hover:text-black"
                            >
                                Features
                            </a>
                            <a
                                href="#categories"
                                className="text-sm font-medium text-black/55 transition hover:text-black"
                            >
                                Categories
                            </a>
                            <a
                                href="#process"
                                className="text-sm font-medium text-black/55 transition hover:text-black"
                            >
                                Process
                            </a>
                            <a
                                href="#cta"
                                className="text-sm font-medium text-black/55 transition hover:text-black"
                            >
                                Launch
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-[1rem] bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/90"
                                >
                                    Open dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="hidden rounded-[1rem] border border-black/10 px-5 py-2.5 text-sm font-semibold text-black hover:bg-black/5 lg:inline-flex"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-2 rounded-[1rem] bg-[#ffd84d] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#facc15]"
                                    >
                                        Register
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <main>
                    <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-20 lg:pb-24">
                        <div className="absolute top-20 left-[-6rem] h-56 w-56 rounded-full bg-[#ffd84d]/50 blur-3xl" />
                        <div className="absolute top-32 right-[-4rem] h-64 w-64 rounded-full bg-[#2563eb]/15 blur-3xl" />
                        <div className="absolute right-1/3 bottom-12 h-40 w-40 rounded-full bg-[#ef4444]/15 blur-3xl" />

                        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
                            <div className="space-y-8">
                                <div className="space-y-5">
                                    <span className="brand-pill bg-white text-black shadow-sm">
                                        Production-ready course operations
                                    </span>
                                    <h1 className="max-w-3xl text-5xl leading-[0.96] font-black tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                                        A learning platform with
                                        <span className="block text-[#2563eb]">
                                            sharper structure
                                        </span>
                                        and a more premium feel.
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-8 text-black/60">
                                        CourseAtlas helps admins control access,
                                        gives teachers serious publishing tools,
                                        and gives students a clean path from
                                        purchase to enrollment to course
                                        completion.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link
                                        href={
                                            auth.user
                                                ? dashboard()
                                                : '/register'
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-black px-7 py-4 text-base font-semibold text-white transition hover:bg-black/90"
                                    >
                                        {auth.user
                                            ? 'Go to dashboard'
                                            : 'Create student account'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <a
                                        href="#features"
                                        className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-black/10 bg-white px-7 py-4 text-base font-semibold text-black transition hover:bg-[#fff6d0]"
                                    >
                                        <Play className="size-4" />
                                        Explore the experience
                                    </a>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-4">
                                    {highlights.map((item) => (
                                        <div
                                            key={item.label}
                                            className="brand-surface p-4"
                                        >
                                            <p className="text-2xl font-black text-black">
                                                {item.value}
                                            </p>
                                            <p className="mt-1 text-[10px] tracking-[0.18em] text-black/45 uppercase">
                                                {item.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="brand-surface-dark relative overflow-hidden p-6 sm:p-8">
                                    <div className="absolute top-12 -left-10 h-32 w-32 rounded-full bg-[#ffd84d]" />
                                    <div className="absolute top-0 right-8 h-24 w-24 rounded-b-[1.75rem] bg-[#2563eb]" />
                                    <div className="absolute bottom-0 left-24 h-20 w-28 rounded-t-[1.5rem] bg-[#ef4444]" />

                                    <div className="relative z-10 grid gap-5">
                                        <div className="brand-surface-glass flex items-center justify-between px-5 py-4">
                                            <div>
                                                <p className="text-[10px] tracking-[0.22em] text-white/50 uppercase">
                                                    Teacher workspace
                                                </p>
                                                <h2 className="mt-1 text-xl font-black text-white">
                                                    Launch course operations
                                                </h2>
                                            </div>
                                            <div className="rounded-full bg-[#ffd84d] px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-black uppercase">
                                                Live
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-[1.2fr,0.8fr]">
                                            <div className="rounded-[1.75rem] bg-white p-5 text-black shadow-lg">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-black/45 uppercase">
                                                        Course capsule
                                                    </p>
                                                    <Star className="size-3.5 text-[#ef4444]" />
                                                </div>
                                                <h3 className="mt-3 text-xl font-black">
                                                    Design Systems for Educators
                                                </h3>
                                                <p className="mt-2 text-xs leading-relaxed text-black/60">
                                                    Enrollment code, chapter
                                                    publishing, student
                                                    visibility, and rating
                                                    feedback in one controlled
                                                    flow.
                                                </p>
                                                <div className="mt-4 flex flex-wrap gap-1.5">
                                                    <span className="brand-tag-yellow">
                                                        $89 beta
                                                    </span>
                                                    <span className="brand-tag-blue">
                                                        24 lessons
                                                    </span>
                                                    <span className="brand-tag-red">
                                                        4.9 rating
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid gap-3">
                                                <div className="rounded-[1.75rem] bg-[#2563eb] p-5 text-white shadow-lg">
                                                    <Users className="size-5" />
                                                    <p className="mt-5 text-3xl font-black">
                                                        218
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-white/75">
                                                        active enrollments
                                                    </p>
                                                </div>
                                                <div className="rounded-[1.75rem] bg-[#ffd84d] p-5 text-black shadow-lg">
                                                    <Bell className="size-5" />
                                                    <p className="mt-5 text-3xl font-black">
                                                        12
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-black/60">
                                                        new chapter alerts
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="brand-surface-glass p-4">
                                                <Award className="size-4 text-[#ffd84d]" />
                                                <p className="mt-3 text-xs font-semibold">
                                                    Premium brand feel
                                                </p>
                                            </div>
                                            <div className="brand-surface-glass p-4">
                                                <GraduationCap className="size-4 text-[#ef4444]" />
                                                <p className="mt-3 text-xs font-semibold">
                                                    Student-centered journey
                                                </p>
                                            </div>
                                            <div className="brand-surface-glass p-4">
                                                <ShieldCheck className="size-4 text-[#2563eb]" />
                                                <p className="mt-3 text-xs font-semibold">
                                                    Admin control built in
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto mt-8 grid max-w-7xl gap-4 lg:grid-cols-[0.9fr,1.1fr]">
                            <div className="brand-surface p-6">
                                <p className="brand-kicker">
                                    Why brands use this look
                                </p>
                                <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-black">
                                    It feels closer to a premium SaaS launch
                                    than a generic template.
                                </h3>
                                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-black/55">
                                    Bigger contrast moves, stronger geometry,
                                    and more varied information density make the
                                    experience feel more commercial without
                                    abandoning clarity.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {proofCards.map((card) => (
                                    <div
                                        key={card.title}
                                        className={`rounded-[1.75rem] p-5 shadow-sm ${card.color}`}
                                    >
                                        <p
                                            className={`text-[10px] font-semibold tracking-[0.22em] uppercase ${card.color.includes('text-white') ? 'text-white/55' : 'text-black/50'}`}
                                        >
                                            {card.title}
                                        </p>
                                        <p className="mt-3 text-3xl font-black tracking-[-0.04em]">
                                            {card.value}
                                        </p>
                                        <p
                                            className={`mt-2 text-xs leading-relaxed ${card.color.includes('text-white') ? 'text-white/65' : 'text-black/55'}`}
                                        >
                                            {card.note}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="categories"
                        className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <p className="brand-kicker">
                                        Popular directions
                                    </p>
                                    <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-black sm:text-4xl">
                                        Course categories that feel curated, not
                                        generic.
                                    </h2>
                                </div>
                                <p className="max-w-xl text-sm leading-relaxed text-black/55">
                                    Inspired by modern education and product
                                    websites, the interface now mixes editorial
                                    spacing, richer layering, and clearer
                                    contrast.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {categories.map((category) => (
                                    <div
                                        key={category.name}
                                        className={`overflow-hidden rounded-[1.75rem] ${category.color}`}
                                    >
                                        <div className="border-b border-black/8 px-6 py-5">
                                            <p className="text-[10px] font-semibold tracking-[0.22em] text-black/45 uppercase">
                                                Category
                                            </p>
                                            <h3 className="mt-2 text-xl font-black">
                                                {category.name}
                                            </h3>
                                        </div>
                                        <div className="px-6 py-5">
                                            <p className="text-xs text-black/60">
                                                {category.courses}
                                            </p>
                                            <p className="mt-4 text-xs leading-relaxed text-black/55">
                                                Ready for structured enrollment,
                                                polished delivery, and strong
                                                visual clarity across desktop
                                                and mobile.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="features"
                        className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr,1.1fr] lg:items-end">
                                <div>
                                    <p className="brand-kicker">
                                        Platform strengths
                                    </p>
                                    <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                                        More layered, more editorial, and more
                                        believable as a real product.
                                    </h2>
                                </div>
                                <p className="text-sm leading-relaxed text-black/55">
                                    The new direction leans on strong asymmetry,
                                    colored utility cards, dense information
                                    panels, and bright call-to-action moments
                                    instead of a flat one-note landing page.
                                </p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                                {features.map((feature) => {
                                    const Icon = feature.icon;

                                    return (
                                        <article
                                            key={feature.title}
                                            className="brand-surface group brand-card-hover p-6"
                                        >
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-[1.15rem] ${feature.accent} ${feature.accent === 'bg-[#ffd84d]' ? 'text-black' : 'text-white'}`}
                                            >
                                                <Icon className="size-5" />
                                            </div>
                                            <h3 className="mt-5 text-xl font-black tracking-[-0.02em] text-black">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-2 text-xs leading-relaxed text-black/55">
                                                {feature.description}
                                            </p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section
                        id="process"
                        className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
                    >
                        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.78fr,1.22fr]">
                            <div className="brand-surface-dark p-8">
                                <p className="brand-kicker text-white/45">
                                    How it works
                                </p>
                                <h2 className="mt-3 text-3xl leading-tight font-black text-white">
                                    Designed around one clean operational loop.
                                </h2>
                                <div className="mt-6 space-y-3">
                                    {journey.map((step, index) => (
                                        <div
                                            key={step}
                                            className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/8 p-4"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffd84d] text-xs font-black text-black">
                                                0{index + 1}
                                            </div>
                                            <p className="text-xs leading-relaxed text-white/70">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="brand-surface brand-grid p-6">
                                    <p className="brand-kicker">
                                        Teacher operations
                                    </p>
                                    <p className="mt-4 text-2xl leading-tight font-black">
                                        Create courses, upload chapters, and
                                        watch enrollments grow.
                                    </p>
                                    <div className="mt-5 flex flex-wrap gap-1.5">
                                        <span className="brand-tag-blue">
                                            Ratings
                                        </span>
                                        <span className="brand-tag-red">
                                            Notifications
                                        </span>
                                        <span className="brand-tag-yellow">
                                            Enrollment codes
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-[1.75rem] bg-[#ef4444] p-6 text-white shadow-md">
                                    <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60 uppercase">
                                        Student flow
                                    </p>
                                    <p className="mt-4 text-2xl leading-tight font-black">
                                        Wishlist, buy, unlock, enroll, learn.
                                    </p>
                                    <p className="mt-3 text-xs leading-relaxed text-white/70">
                                        The journey stays simple while still
                                        feeling rich and intentional.
                                    </p>
                                </div>

                                <div className="rounded-[1.75rem] bg-[#2563eb] p-6 text-white shadow-md">
                                    <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60 uppercase">
                                        Admin control
                                    </p>
                                    <p className="mt-4 text-2xl leading-tight font-black">
                                        Role-based access without public
                                        registration.
                                    </p>
                                    <p className="mt-3 text-xs leading-relaxed text-white/70">
                                        Safer by default and aligned with
                                        managed education workflows.
                                    </p>
                                </div>

                                <div className="brand-surface p-6">
                                    <p className="brand-kicker">
                                        Why it feels better
                                    </p>
                                    <ul className="mt-4 space-y-3">
                                        {[
                                            'Higher contrast and clearer information hierarchy',
                                            'Brighter accent colors used intentionally instead of everywhere',
                                            'More visual depth through layered panels and mixed densities',
                                        ].map((item) => (
                                            <li
                                                key={item}
                                                className="flex gap-2.5 text-xs leading-relaxed text-black/55"
                                            >
                                                <Check className="mt-0.5 size-3.5 shrink-0 text-black" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="cta"
                        className="px-4 pt-8 pb-16 sm:px-6 lg:px-8"
                    >
                        <div className="mx-auto max-w-7xl">
                            <div className="brand-surface-dark relative overflow-hidden px-8 py-12 text-center sm:px-12 sm:py-16">
                                <div className="absolute top-0 left-10 h-24 w-24 rounded-b-[2rem] bg-[#ffd84d]" />
                                <div className="absolute top-8 right-16 h-28 w-28 rounded-full bg-[#2563eb]" />
                                <div className="absolute right-8 bottom-0 h-24 w-24 rounded-tl-[2rem] bg-[#ef4444]" />

                                <div className="relative z-10 mx-auto max-w-3xl">
                                    <p className="brand-kicker text-white/50">
                                        Ready to use it
                                    </p>
                                    <h2 className="mt-3 text-3xl leading-tight font-black text-white sm:text-4xl">
                                        Launch a cleaner learning platform with
                                        a stronger first impression.
                                    </h2>
                                    <p className="mt-4 text-sm leading-relaxed text-white/65">
                                        The frontend now has a more distinctive
                                        visual identity. If you want, the next
                                        pass can make the dashboards even more
                                        advanced with charts, richer tables, and
                                        animated transitions.
                                    </p>
                                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                        <Link
                                            href={
                                                auth.user
                                                    ? dashboard()
                                                    : '/register'
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-[#ffd84d] px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-[#facc15]"
                                        >
                                            {auth.user
                                                ? 'Open workspace'
                                                : 'Register now'}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                        <a
                                            href="#categories"
                                            className="inline-flex items-center justify-center rounded-[1rem] border border-white/12 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/12"
                                        >
                                            Browse sections
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
