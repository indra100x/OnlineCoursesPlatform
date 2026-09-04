<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserStoreRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
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

        return response()->json([
            'message' => 'User created successfully.',
            'user' => new UserResource($user),
        ], 201);
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->updateUser($user, $request->validated());

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

        $this->userService->deleteUser($user);

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
