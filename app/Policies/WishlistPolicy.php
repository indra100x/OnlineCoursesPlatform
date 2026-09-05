<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Wishlist;

class WishlistPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'student';
    }

    public function view(User $user, Wishlist $wishlist): bool
    {
        return $user->id === $wishlist->student_id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'student';
    }

    public function delete(User $user, Wishlist $wishlist): bool
    {
        return $user->id === $wishlist->student_id;
    }
}
