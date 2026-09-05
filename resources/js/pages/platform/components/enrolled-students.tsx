import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/platform/empty-state';
import type { PlatformUser } from '@/types/platform';

type EnrolledStudentsProps = {
    students: PlatformUser[];
};

export function EnrolledStudents({ students }: EnrolledStudentsProps) {
    return (
        <div className="brand-surface p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-black text-white">
                    <Users className="size-4" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-black">
                        Enrolled students
                    </h3>
                    <p className="text-xs text-black/50">
                        Students currently learning inside this course.
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {students.length === 0 ? (
                    <EmptyState
                        title="No students enrolled yet"
                        description="Beta buyers can unlock the code, then enroll here once they use it."
                    />
                ) : (
                    students.map((student) => (
                        <Link
                            key={student.id}
                            to={`/dashboard/students/${student.id}`}
                            className="block rounded-[1.15rem] border border-black/8 bg-[#fffdf7] p-3.5 transition hover:border-[#2563eb]/20 hover:shadow-sm"
                        >
                            <p className="text-sm font-semibold text-black">
                                {student.name}
                            </p>
                            <p className="text-xs text-black/50">
                                {student.email}
                            </p>
                            <p className="mt-2 text-[10px] font-semibold tracking-[0.16em] text-[#2563eb] uppercase">
                                View profile
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
