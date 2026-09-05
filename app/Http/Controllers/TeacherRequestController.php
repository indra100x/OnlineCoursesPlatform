<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeacherRequestStoreRequest;
use App\Http\Resources\TeacherRequestResource;
use App\Models\TeacherRequest;
use App\Services\AuditLogService;
use App\Services\TeacherRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherRequestController extends Controller
{
    public function __construct(
        protected TeacherRequestService $teacherRequestService,
    ) {}

    public function store(TeacherRequestStoreRequest $request): JsonResponse
    {
        $teacherRequest = $this->teacherRequestService->submitRequest($request->validated());

        return response()->json([
            'message' => 'Your teacher registration request has been submitted. An admin will review it shortly.',
            'teacher_request' => new TeacherRequestResource($teacherRequest),
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 20), 100);
        $requests = $this->teacherRequestService->getRequests($perPage);

        return response()->json([
            'data' => TeacherRequestResource::collection($requests),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function approve(Request $request, TeacherRequest $teacherRequest): JsonResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $this->teacherRequestService->approveRequest(
            $teacherRequest,
            $validated['admin_notes'] ?? null
        );

        AuditLogService::logTeacherRequestApproved($request->user()->id, $teacherRequest->id);

        return response()->json([
            'message' => 'Teacher request approved. Account created successfully.',
            'user' => $user->only(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }

    public function reject(Request $request, TeacherRequest $teacherRequest): JsonResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->teacherRequestService->rejectRequest(
            $teacherRequest,
            $validated['admin_notes'] ?? null
        );

        AuditLogService::logTeacherRequestRejected($request->user()->id, $teacherRequest->id);

        return response()->json([
            'message' => 'Teacher request rejected.',
        ]);
    }
}
