import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/platform/empty-state';
import type { Course } from '@/types/platform';

type TeacherCourseListProps = {
    courses: Course[];
    selectedCourseId: number | null;
    onSelect: (course: Course) => void;
    loading: boolean;
};

export function TeacherCourseList({
    courses,
    selectedCourseId,
    onSelect,
    loading,
}: TeacherCourseListProps) {
    return (
        <div className="brand-surface p-5">
            <h2 className="text-base font-semibold text-black">Your courses</h2>
            <div className="mt-3 space-y-2">
                {loading ? (
                    <p className="text-sm text-black/45">Loading courses...</p>
                ) : courses.length === 0 ? (
                    <EmptyState
                        title="No courses yet"
                        description="Create your first course to start selling beta access and publishing PDF chapters."
                    />
                ) : (
                    courses.map((course) => (
                        <button
                            key={course.id}
                            type="button"
                            onClick={() => onSelect(course)}
                            className={`w-full rounded-[1.25rem] border p-4 text-left transition-all ${
                                selectedCourseId === course.id
                                    ? 'border-black bg-black text-white'
                                    : 'border-black/8 bg-[#fffdf7] hover:border-[#2563eb]/30 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        {course.title}
                                    </p>
                                    <p
                                        className={`mt-0.5 line-clamp-2 text-xs ${selectedCourseId === course.id ? 'text-white/65' : 'text-black/55'}`}
                                    >
                                        {course.description}
                                    </p>
                                </div>
                                <BookOpen className="size-4 shrink-0" />
                            </div>
                            <div
                                className={`mt-3 flex flex-wrap gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase ${selectedCourseId === course.id ? 'text-white/60' : 'text-black/45'}`}
                            >
                                <span>${Number(course.price).toFixed(2)}</span>
                                <span>
                                    {course.enrollments_count ?? 0} students
                                </span>
                                <span>
                                    {course.ratings_avg_rating
                                        ? `${Number(course.ratings_avg_rating).toFixed(1)} stars`
                                        : 'No ratings'}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
