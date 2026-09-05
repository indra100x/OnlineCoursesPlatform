<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;

class EnrollmentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher']);
    }

    public function view(User $user, Enrollment $enrollment): bool
    {
        if ($user->id === $enrollment->student_id) {
            return true;
        }

        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'teacher') {
            return $enrollment->course->teacher_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Enrollment $enrollment): bool
    {
        return $user->id === $enrollment->student_id;
    }
}
