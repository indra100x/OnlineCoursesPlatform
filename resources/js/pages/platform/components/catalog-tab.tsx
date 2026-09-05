import {
    Heart,
    ShoppingBag,
    Star,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Course } from '@/types/platform';

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type CatalogTabProps = {
    catalog: Course[];
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onPurchase: (courseId: number) => void;
    onToggleWishlist: (course: Course) => void;
    onEnroll: (code: string) => void;
};

export function CatalogTab({
    catalog,
    pagination,
    onPageChange,
    onPurchase,
    onToggleWishlist,
    onEnroll,
}: CatalogTabProps) {
    return (
        <>
            <div>
                <h2 className="text-base font-semibold text-black">
                    Course catalog
                </h2>
                <p className="text-xs text-black/50">
                    Save favorites, beta-buy courses, and unlock enrollment
                    codes.
                </p>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {catalog.map((course) => (
                    <div
                        key={course.id}
                        className="rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-black">
                                    {course.title}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-xs text-black/50">
                                    {course.description}
                                </p>
                                {course.teacher ? (
                                    <Link
                                        to={`/dashboard/teachers/${course.teacher.id}`}
                                        className="mt-2 inline-flex text-[10px] font-semibold tracking-[0.18em] text-[#2563eb] uppercase transition hover:text-black"
                                    >
                                        Teacher {course.teacher.name}
                                    </Link>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={() => void onToggleWishlist(course)}
                                className="shrink-0 text-rose-500"
                            >
                                <Heart
                                    className={`size-4 ${course.is_wishlisted ? 'fill-current' : ''}`}
                                />
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-black/60">
                            <span className="rounded-full bg-[#ffd84d] px-2.5 py-0.5 font-medium text-black">
                                ${Number(course.price).toFixed(2)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Star className="size-3 text-[#ef4444]" />
                                {course.ratings_avg_rating
                                    ? Number(course.ratings_avg_rating).toFixed(
                                          1,
                                      )
                                    : 'No rating'}
                            </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {course.is_purchased ? (
                                <>
                                    <div className="rounded-[0.8rem] bg-[#edf4ff] px-3 py-1.5 text-[11px] font-medium text-[#2563eb]">
                                        Code: {course.enrollment_code}
                                    </div>
                                    {!course.is_enrolled ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="rounded-[0.8rem] bg-black text-[11px] text-white hover:bg-black/90"
                                            onClick={() =>
                                                void onEnroll(
                                                    course.enrollment_code ??
                                                        '',
                                                )
                                            }
                                        >
                                            Enroll now
                                        </Button>
                                    ) : null}
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-[0.8rem] bg-[#ffd84d] text-[11px] text-black hover:bg-[#facc15]"
                                    onClick={() => void onPurchase(course.id)}
                                >
                                    <ShoppingBag className="size-3" />
                                    Beta buy
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {pagination && pagination.last_page > 1 ? (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-black/40">
                        Page {pagination.current_page} of {pagination.last_page}{' '}
                        ({pagination.total} courses)
                    </p>
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={pagination.current_page <= 1}
                            onClick={() =>
                                onPageChange(pagination.current_page - 1)
                            }
                        >
                            <ChevronLeft className="size-3" />
                        </Button>
                        {Array.from(
                            { length: Math.min(pagination.last_page, 5) },
                            (_, i) => {
                                const start = Math.max(
                                    1,
                                    pagination.current_page - 2,
                                );
                                const page = start + i;

                                if (page > pagination.last_page) {
                                    return null;
                                }

                                return (
                                    <Button
                                        key={page}
                                        type="button"
                                        variant={
                                            page === pagination.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        className="h-7 w-7 p-0 text-[11px]"
                                        onClick={() => onPageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                );
                            },
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={
                                pagination.current_page >= pagination.last_page
                            }
                            onClick={() =>
                                onPageChange(pagination.current_page + 1)
                            }
                        >
                            <ChevronRight className="size-3" />
                        </Button>
                    </div>
                </div>
            ) : null}
        </>
    );
}
