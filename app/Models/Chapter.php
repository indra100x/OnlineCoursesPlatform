<?php

namespace App\Models;

use App\Concerns\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable(['course_id', 'title', 'position', 'file_path', 'file_name', 'file_size'])]
/**
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property int $position
 * @property string $file_path
 * @property string $file_name
 * @property int $file_size
 * @property Carbon $created_at
 */
class Chapter extends Model
{
    use Auditable;

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'position' => 'integer',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
