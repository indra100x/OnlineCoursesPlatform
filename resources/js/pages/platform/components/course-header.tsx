import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Course } from '@/types/platform';

type CourseHeaderProps = {
    course: Course;
    onDelete: (courseId: number) => void;
};

export function CourseHeader({ course, onDelete }: CourseHeaderProps) {
    return (
        <div className="brand-surface-dark p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-white/50 uppercase">
                        Code: {course.enrollment_code}
                    </p>
                    <h2 className="mt-1.5 text-xl font-bold text-white">
                        {course.title}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-white/65">
                        {course.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="rounded-full bg-[#ffd84d] px-3 py-1 font-medium text-black">
                            ${Number(course.price).toFixed(2)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-white/65">
                            <Star className="size-3.5 fill-[#ffd84d] text-[#ffd84d]" />
                            {course.ratings_avg_rating
                                ? Number(course.ratings_avg_rating).toFixed(1)
                                : 'No rating yet'}
                        </span>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-[1rem] border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => void onDelete(course.id)}
                >
                    <Trash2 className="size-3.5" />
                    Delete
                </Button>
            </div>
        </div>
    );
}
