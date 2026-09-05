<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\Collection;

class WishlistService
{
    public function getWishlistForStudent(User $student): Collection
    {
        return Course::query()
            ->whereHas('wishlistItems', fn ($query) => $query->where('student_id', $student->id))
            ->with(['teacher:id,name,email,avatar_path,bio'])
            ->withCount(['chapters', 'ratings'])
            ->withAvg('ratings', 'rating')
            ->latest()
            ->get();
    }

    public function addToWishlist(User $student, int $courseId): void
    {
        Wishlist::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $courseId,
        ]);
    }

    public function removeFromWishlist(User $student, Course $course): bool
    {
        return Wishlist::query()
            ->where('student_id', $student->id)
            ->where('course_id', $course->id)
            ->delete() > 0;
    }
}
