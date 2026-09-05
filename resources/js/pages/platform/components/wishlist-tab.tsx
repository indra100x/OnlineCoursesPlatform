import { BookHeart, CreditCard } from 'lucide-react';
import { EmptyState } from '@/components/platform/empty-state';
import { Button } from '@/components/ui/button';
import type { Course } from '@/types/platform';

type WishlistTabProps = {
    wishlist: Course[];
    onPurchase: (courseId: number) => void;
    onToggleWishlist: (course: Course) => void;
};

export function WishlistTab({ wishlist, onPurchase, onToggleWishlist }: WishlistTabProps) {
    return (
        <>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-[#ef4444] text-white">
                    <BookHeart className="size-4" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-black">Wishlist</h2>
                    <p className="text-xs text-black/50">Your saved courses waiting for a future beta purchase.</p>
                </div>
            </div>
            <div className="mt-4 space-y-3">
                {wishlist.length === 0 ? (
                    <EmptyState title="Wishlist is empty" description="Save courses from the catalog to keep track of what you want next." />
                ) : (
                    wishlist.map((course) => (
                        <div key={course.id} className="rounded-[1.25rem] border border-black/8 bg-[#fffdf7] p-4">
                            <p className="text-sm font-semibold text-black">{course.title}</p>
                            <p className="mt-0.5 text-xs text-black/50 line-clamp-2">{course.description}</p>
                            <div className="mt-3 flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-[0.8rem] bg-[#ffd84d] text-black hover:bg-[#facc15] text-[11px]"
                                    onClick={() => void onPurchase(course.id)}
                                >
                                    <CreditCard className="size-3" />
                                    Beta buy
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-[0.8rem] text-[11px]"
                                    onClick={() => void onToggleWishlist({ ...course, is_wishlisted: true })}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
