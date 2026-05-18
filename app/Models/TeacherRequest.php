<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherRequest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'password',
        'bio',
        'proof_link',
        'status',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
