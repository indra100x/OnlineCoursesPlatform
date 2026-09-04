<?php

namespace App\Models;

use App\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'course_id', 'amount', 'status', 'reference', 'purchased_at'])]
class CoursePurchase extends Model
{
    use Auditable;
    public const STATUS_BETA_PAID = 'beta_paid';

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'purchased_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
