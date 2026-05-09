import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Users, Zap, Award, Play, ArrowRight, Check } from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    const features = [
        {
            icon: BookOpen,
            title: 'Create Courses',
            description: 'Build engaging courses with PDFs, videos, and links. Share knowledge with the world.',
        },
        {
            icon: Users,
            title: 'Connect Learners',
            description: 'Build your student community and track their progress in real-time.',
        },
        {
            icon: Zap,
            title: 'Fast Delivery',
            description: 'Instant access to course materials with lightning-fast performance.',
        },
        {
            icon: Award,
            title: 'Track Success',
            description: 'Monitor ratings, reviews, and student engagement metrics.',
        },
    ];

    const stats = [
        { number: '10K+', label: 'Active Learners' },
        { number: '500+', label: 'Courses' },
        { number: '4.9★', label: 'Average Rating' },
    ];

    const pricing = [
        {
            name: 'Free',
            price: '$0',
            description: 'Perfect for getting started',
            features: ['Up to 3 courses', 'Basic analytics', 'Community support'],
        },
        {
            name: 'Pro',
            price: '$29',
            period: '/month',
            description: 'For active educators',
            features: ['Unlimited courses', 'Advanced analytics', 'Priority support', 'Custom branding'],
            highlighted: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For institutions',
            features: ['Everything in Pro', 'API access', 'Dedicated support', 'Custom features'],
        },
    ];

    return (
        <>
            <Head title="CourseHub - Learn & Teach Online" />
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
                {/* Navigation */}
                <nav className="border-b border-purple-500/20 bg-black/40 backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="size-6 text-white"
                                    >
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    CourseHub
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
                                    >
                                        Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-lg px-6 py-2.5 font-medium text-gray-300 transition-colors hover:text-white"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/50"
                                        >
                                            Sign Up
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
                    {/* Gradient orbs */}
                    <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-10 blur-3xl" />
                    <div className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 opacity-10 blur-3xl" />

                    <div className="relative mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                            Empower Learning,
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Create Impact
                            </span>
                        </h1>

                        <p className="mb-8 text-lg text-gray-300 sm:text-xl">
                            Build and share courses with your students. From PDFs to videos—everything you need to teach and
                            inspire on one beautiful platform.
                        </p>

                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href={login()}
                                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-purple-500/50"
                            >
                                <Play className="size-5" />
                                Get Started Free
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/30 px-8 py-4 font-semibold text-gray-100 transition-all hover:border-purple-500/50 hover:bg-purple-500/10">
                                Watch Demo
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid gap-8 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <div key={stat.label} className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-6 backdrop-blur-sm">
                                    <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                                        {stat.number}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-white">Powerful Features for Educators</h2>
                            <p className="text-gray-400">Everything you need to create, manage, and grow your courses</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={feature.title}
                                        className="group rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 transition-all hover:border-purple-500/50 hover:bg-purple-500/20 backdrop-blur-sm"
                                    >
                                        <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-3">
                                            <Icon className="size-6 text-purple-400" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                                        <p className="text-sm text-gray-400">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="relative px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-white">Get Started in Minutes</h2>
                            <p className="text-gray-400">Three simple steps to launch your first course</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    number: '01',
                                    title: 'Create Your Course',
                                    description: 'Set up your course with title, description, and pricing.',
                                },
                                {
                                    number: '02',
                                    title: 'Add Content',
                                    description: 'Upload PDFs, videos, or add links to external resources.',
                                },
                                {
                                    number: '03',
                                    title: 'Share & Earn',
                                    description: 'Share your enrollment code and start teaching your students.',
                                },
                            ].map((step) => (
                                <div key={step.number} className="text-center">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
                                        <span className="text-2xl font-bold text-white">{step.number}</span>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                                    <p className="text-gray-400">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="relative px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
                            <p className="text-gray-400">Choose the plan that works best for you</p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {pricing.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`rounded-xl border transition-all ${
                                        plan.highlighted
                                            ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-xl shadow-purple-500/20 scale-105'
                                            : 'border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:border-purple-500/30'
                                    } p-8 backdrop-blur-sm`}
                                >
                                    <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="mb-4 text-sm text-gray-400">{plan.description}</p>

                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                                        {plan.period && <span className="text-gray-400">{plan.period}</span>}
                                    </div>

                                    <button
                                        className={`mb-6 w-full rounded-lg py-3 font-semibold transition-all ${
                                            plan.highlighted
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                                                : 'border border-purple-500/30 text-gray-100 hover:bg-purple-500/10'
                                        }`}
                                    >
                                        Get Started
                                    </button>

                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                                <Check className="size-4 text-purple-400" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative px-4 py-20 sm:px-6 lg:px-8">
                    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-8 py-16 text-center backdrop-blur-sm">
                        {/* Background decorations */}
                        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-600 opacity-20 blur-3xl" />
                        <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-blue-600 opacity-20 blur-3xl" />

                        <div className="relative">
                            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                                Ready to Transform Your Teaching?
                            </h2>
                            <p className="mb-8 text-lg text-gray-300">Join thousands of educators building amazing learning experiences.</p>
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-purple-500/50"
                            >
                                Start Teaching Today
                                <ArrowRight className="size-5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-purple-500/20 bg-black/40 px-4 py-8 sm:px-6 lg:px-8 backdrop-blur-md">
                    <div className="mx-auto max-w-6xl">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-5 text-white">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-white">CourseHub</span>
                            </div>
                            <p className="text-sm text-gray-400">&copy; 2026 CourseHub. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
