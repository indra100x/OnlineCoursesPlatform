<?php

namespace App\Services;

use App\Exceptions\TeacherRequestException;
use App\Models\TeacherRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeacherRequestService
{
    public function submitRequest(array $data): TeacherRequest
    {
        $data['password'] = Hash::make($data['password']);

        return TeacherRequest::create($data);
    }

    public function approveRequest(TeacherRequest $teacherRequest, ?string $notes = null): User
    {
        if ($teacherRequest->status !== 'pending') {
            throw new TeacherRequestException('This request has already been '.$teacherRequest->status.'.', 422);
        }

        $user = User::create([
            'name' => $teacherRequest->name,
            'email' => $teacherRequest->email,
            'password' => $teacherRequest->password,
            'role' => User::ROLE_TEACHER,
            'bio' => $teacherRequest->bio,
        ]);

        $teacherRequest->update([
            'status' => 'approved',
            'admin_notes' => $notes,
            'password' => null,
        ]);

        return $user;
    }

    public function rejectRequest(TeacherRequest $teacherRequest, ?string $notes = null): void
    {
        if ($teacherRequest->status !== 'pending') {
            throw new TeacherRequestException('This request has already been '.$teacherRequest->status.'.', 422);
        }

        $teacherRequest->update([
            'status' => 'rejected',
            'admin_notes' => $notes,
            'password' => null,
        ]);
    }

    public function getRequests(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return TeacherRequest::query()
            ->latest()
            ->limit($limit)
            ->get();
    }
}
