<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateApiRequest;
use App\Http\Requests\PasswordUpdateApiRequest;
use App\Http\Resources\ProfileResource;
use App\Services\AuditLogService;
use App\Support\MediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function __construct(
        protected MediaStorage $mediaStorage,
    ) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'profile' => new ProfileResource($request->user()),
        ]);
    }

    public function update(ProfileUpdateApiRequest $request): JsonResponse
    {
        $user = $request->user();
        $payload = [
            'name' => $request->name,
            'bio' => $request->bio ?? null,
        ];

        if ($request->file('avatar')) {
            $payload['avatar_path'] = $this->mediaStorage->storeImage(
                $request->file('avatar'),
                'avatars'
            );
        }

        $user->update($payload);

        AuditLogService::logProfileUpdated($user->id, array_keys($payload));

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => new ProfileResource($user->fresh()),
        ]);
    }

    public function updatePassword(PasswordUpdateApiRequest $request): JsonResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        AuditLogService::logPasswordChanged($request->user()->id);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully.',
        ]);
    }
}
