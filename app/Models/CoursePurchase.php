<?php

namespace App\Models;

use App\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable(['student_id', 'course_id', 'amount', 'status', 'reference', 'purchased_at'])]
/**
 * @property int $id
 * @property int $student_id
 * @property int $course_id
 * @property string $amount
 * @property string $status
 * @property Carbon $created_at
 */
class CoursePurchase extends Model
{
    use Auditable;

    const STATUS_BETA_PAID = 'beta_paid';

    const VALID_STATUSES = [self::STATUS_BETA_PAID];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'purchased_at' => 'datetime',
        ];
    }

    public function validateStatus(string $status): bool
    {
        return in_array($status, self::VALID_STATUSES, true);
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
