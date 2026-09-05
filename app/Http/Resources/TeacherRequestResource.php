<?php

namespace App\Http\Resources;

use App\Models\TeacherRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**  TeacherRequest */
class TeacherRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'bio' => $this->bio,
            'proof_link' => $this->proof_link,
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
