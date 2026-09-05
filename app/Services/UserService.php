<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function createUser(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);
    }

    public function updateUser(User $user, array $data): User
    {
        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user->fresh();
    }

    public function deleteUser(User $user): bool
    {
        return $user->delete();
    }

    public function getUsers(): LengthAwarePaginator
    {
        return User::query()
            ->select(['id', 'name', 'email', 'role', 'created_at', 'updated_at'])
            ->latest()
            ->paginate(50);
    }

    public function getUserStats(): array
    {
        return [
            'total' => User::count(),
            'teachers' => User::where('role', 'teacher')->count(),
            'students' => User::where('role', 'student')->count(),
        ];
    }
}
