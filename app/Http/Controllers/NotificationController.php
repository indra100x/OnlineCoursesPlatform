<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $notifications = $this->notificationService->getNotifications($request->user());

        return NotificationResource::collection($notifications);
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        $this->notificationService->markAsRead($notification, $request->user());

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => new NotificationResource($notification->fresh()),
        ]);
    }
}
