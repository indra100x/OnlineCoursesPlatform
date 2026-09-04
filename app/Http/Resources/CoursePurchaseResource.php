<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoursePurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'course_id' => $this->course_id,
            'amount' => $this->amount,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
