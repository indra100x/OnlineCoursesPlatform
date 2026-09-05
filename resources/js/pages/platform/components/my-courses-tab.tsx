import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/platform/empty-state';
import type { StudentCourse } from '@/types/platform';

type MyCoursesTabProps = {
    courses: StudentCourse[];
};

export function MyCoursesTab({ courses }: MyCoursesTabProps) {
    return (
        <>
            <div>
                <h2 className="text-base font-semibold text-black">My learning space</h2>
                <p className="text-xs text-black/50">Open any enrolled course to review chapters and leave a rating.</p>
            </div>
            <div className="mt-4 space-y-3">
                {courses.length === 0 ? (
                    <EmptyState title="No enrolled courses" description="Buy a course in beta, unlock the code, then enroll here." />
                ) : (
                    courses.map((course) => (
                        <Link
                            key={course.id}
                            to={`/dashboard/courses/${course.id}`}
                            className="block rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4 transition hover:border-[#2563eb]/20 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-black">{course.title}</p>
                                    <p className="mt-0.5 text-xs text-black/50 line-clamp-2">{course.description}</p>
                                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                                        Teacher {course.teacher.name}
                                    </p>
                                </div>
                                <BookOpen className="size-4 shrink-0 text-[#ef4444]" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </>
    );
}
