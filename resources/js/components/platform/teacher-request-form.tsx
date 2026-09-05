import { Link, useForm, Head } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type TeacherRequestForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    bio: string;
    proof_link: string;
    honeypot: string;
};

export default function TeacherRegister() {
    const { data, setData, post, processing, errors, reset, wasSuccessful } =
        useForm<TeacherRequestForm>({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            bio: '',
            proof_link: '',
            honeypot: '',
        });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, [reset]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('teacher-requests.store'));
    };

    if (wasSuccessful) {
        return (
            <>
                <Head title="Request Submitted" />
                <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
                    <Card className="w-full max-w-md text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">
                                Request Submitted!
                            </CardTitle>
                            <CardDescription>
                                Your teacher account request has been submitted
                                for review. You will receive an email with login
                                credentials once approved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={route('home')}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Home
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Request Teacher Access" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">
                            Request Teacher Access
                        </CardTitle>
                        <CardDescription>
                            Submit a request to create a teacher account on
                            CourseAtlas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="proof_link">
                                    Professional Profile or Portfolio URL
                                </Label>
                                <Input
                                    id="proof_link"
                                    type="url"
                                    placeholder="https://linkedin.com/in/your-profile"
                                    value={data.proof_link}
                                    onChange={(e) =>
                                        setData('proof_link', e.target.value)
                                    }
                                    required
                                />
                                {errors.proof_link && (
                                    <p className="text-sm text-destructive">
                                        {errors.proof_link}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio (Optional)</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell us about your teaching experience and expertise..."
                                    value={data.bio}
                                    onChange={(e) =>
                                        setData('bio', e.target.value)
                                    }
                                    rows={3}
                                />
                                {errors.bio && (
                                    <p className="text-sm text-destructive">
                                        {errors.bio}
                                    </p>
                                )}
                            </div>

                            {/* Honeypot field */}
                            <div
                                className="absolute -left-[9999px]"
                                aria-hidden="true"
                            >
                                <Input
                                    tabIndex={-1}
                                    value={data.honeypot}
                                    onChange={(e) =>
                                        setData('honeypot', e.target.value)
                                    }
                                    autoComplete="off"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Submitting Request...'
                                    : 'Submit Request'}
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
