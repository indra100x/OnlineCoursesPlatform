<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'course_id' => $this->course_id,
            'rating' => $this->rating,
            'review' => $this->review,
            'created_at' => $this->created_at,
            'student' => new UserResource($this->whenLoaded('student')),
        ];
    }
}
