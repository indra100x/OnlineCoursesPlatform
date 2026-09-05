<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserStoreRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserManagementController extends Controller
{
    public function __construct(
        protected UserService $userService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $users = $this->userService->getUsers();

        return UserResource::collection($users);
    }

    public function store(UserStoreRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        AuditLogService::logUserCreated($request->user()->id, $user->id, $user->role);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => new UserResource($user),
        ], 201);
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $oldRole = $user->role;
        $user = $this->userService->updateUser($user, $request->validated());

        AuditLogService::logUserUpdated($request->user()->id, $user->id, [
            'role' => $oldRole !== $user->role ? $oldRole.' → '.$user->role : null,
        ]);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => new UserResource($user),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->is($user)) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $deletedUserId = $user->id;
        $this->userService->deleteUser($user);

        AuditLogService::logUserDeleted($request->user()->id, $deletedUserId);

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
