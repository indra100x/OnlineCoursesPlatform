<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**  Course */
class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isOwner = $request->user()?->id === $this->teacher_id;
        $hasPurchased = $this->is_purchased ?? false;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'teacher_id' => $this->teacher_id,
            'enrollment_code' => $this->when($isOwner || $hasPurchased, $this->enrollment_code),
            'teacher' => new TeacherResource($this->whenLoaded('teacher')),
            'chapters_count' => $this->whenCounted('chapters'),
            'enrollments_count' => $this->whenCounted('enrollments'),
            'ratings_count' => $this->whenCounted('ratings'),
            'ratings_avg_rating' => $this->when(isset($this->ratings_avg_rating), fn () => $this->ratings_avg_rating),
            'is_purchased' => $this->when(isset($this->is_purchased), fn () => $this->is_purchased),
            'is_wishlisted' => $this->when(isset($this->is_wishlisted), fn () => $this->is_wishlisted),
            'is_enrolled' => $this->when(isset($this->is_enrolled), fn () => $this->is_enrolled),
            'created_at' => $this->created_at,
        ];
    }
}
