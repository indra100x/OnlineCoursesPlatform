<?php

namespace App\Http\Controllers;

use App\Models\TeacherRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeacherRequestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email', 'unique:teacher_requests,email'],
            'password' => ['required', 'string', 'min:8'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'proof_link' => ['nullable', 'url', 'max:2048'],
        ]);

        $teacherRequest = TeacherRequest::create($validated);

        return response()->json([
            'message' => 'Your teacher registration request has been submitted. An admin will review it shortly.',
            'teacher_request' => $teacherRequest->only(['id', 'name', 'email', 'status', 'created_at']),
        ], 201);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'teacher_requests' => TeacherRequest::query()
                ->latest()
                ->get()
                ->map(fn ($req) => [
                    'id' => $req->id,
                    'name' => $req->name,
                    'email' => $req->email,
                    'bio' => $req->bio,
                    'proof_link' => $req->proof_link,
                    'status' => $req->status,
                    'admin_notes' => $req->admin_notes,
                    'created_at' => $req->created_at,
                    'updated_at' => $req->updated_at,
                ]),
        ]);
    }

    public function approve(Request $request, TeacherRequest $teacherRequest): JsonResponse
    {
        if ($teacherRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been ' . $teacherRequest->status . '.',
            ], 422);
        }

        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = User::create([
            'name' => $teacherRequest->name,
            'email' => $teacherRequest->email,
            'password' => $teacherRequest->password,
            'role' => User::ROLE_TEACHER,
            'bio' => $teacherRequest->bio,
        ]);

        $teacherRequest->update([
            'status' => 'approved',
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Teacher request approved. Account created successfully.',
            'user' => $user->only(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }

    public function reject(Request $request, TeacherRequest $teacherRequest): JsonResponse
    {
        if ($teacherRequest->status !== 'pending') {
            return response()->json([
                'message' => 'This request has already been ' . $teacherRequest->status . '.',
            ], 422);
        }

        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $teacherRequest->update([
            'status' => 'rejected',
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Teacher request rejected.',
        ]);
    }
}
