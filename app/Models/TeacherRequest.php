<?php

namespace App\Models;

use App\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $bio
 * @property string|null $proof_link
 * @property string $status
 * @property string|null $admin_notes
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['name', 'email', 'password', 'bio', 'proof_link', 'status', 'admin_notes'])]
#[Hidden(['password'])]
class TeacherRequest extends Model
{
    use Auditable, HasFactory;
}
