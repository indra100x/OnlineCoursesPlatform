<?php

namespace App\Http\Resources;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**  Notification */
class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'course_id' => $this->course_id,
            'chapter_id' => $this->chapter_id,
            'type' => $this->type,
            'data' => $this->data,
            'message' => $this->message,
            'is_read' => $this->is_read,
            'created_at' => $this->created_at,
            'course' => new CourseResource($this->whenLoaded('course')),
            'chapter' => new ChapterResource($this->whenLoaded('chapter')),
        ];
    }
}
