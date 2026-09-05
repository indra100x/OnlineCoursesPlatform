<?php

namespace App\Models;

use App\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'password', 'bio', 'proof_link', 'status', 'admin_notes'])]
#[Hidden(['password'])]
class TeacherRequest extends Model
{
    use Auditable, HasFactory;
}
