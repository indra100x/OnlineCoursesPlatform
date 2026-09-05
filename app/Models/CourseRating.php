<?php

namespace App\Models;

use App\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable(['student_id', 'course_id', 'rating', 'review'])]
/**
 * @property int $id
 * @property int $student_id
 * @property int $course_id
 * @property int $rating
 * @property string|null $review
 * @property Carbon $created_at
 */
class CourseRating extends Model
{
    use Auditable;

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
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
