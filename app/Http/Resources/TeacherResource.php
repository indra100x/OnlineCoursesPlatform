<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->when(
                $request->user()?->id === $this->id || $request->user()?->role === 'admin',
                $this->email,
            ),
            'avatar_path' => $this->avatar_path,
            'bio' => $this->bio,
        ];
    }
}
