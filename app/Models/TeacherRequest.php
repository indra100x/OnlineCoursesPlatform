<?php

namespace App\Models;

use App\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;

class TeacherRequest extends Model
{
    use Auditable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'bio',
        'proof_link',
        'status',
        'admin_notes',
    ];

    protected $hidden = [
        'password',
    ];
}
