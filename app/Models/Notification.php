<?php

namespace App\Models;

use Database\Factories\NotificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $course_id
 * @property int|null $chapter_id
 * @property string $type
 * @property array<string, mixed> $data
 * @property string $message
 * @property bool $is_read
 * @property Carbon $created_at
 */
#[Fillable(['user_id', 'course_id', 'chapter_id', 'type', 'data', 'message', 'is_read'])]
class Notification extends Model
{
    /** @use HasFactory<NotificationFactory> */
    use HasFactory;

    public const TYPE_CHAPTER_CREATED = 'chapter_created';
    public const TYPE_COURSE_UPDATED = 'course_updated';
    public const TYPE_COURSE_DELETED = 'course_deleted';
    public const TYPE_COURSE_ENROLLED = 'course_enrolled';
    public const TYPE_COURSE_PURCHASED = 'course_purchased';

    const VALID_TYPES = [
        self::TYPE_CHAPTER_CREATED,
        self::TYPE_COURSE_UPDATED,
        self::TYPE_COURSE_DELETED,
        self::TYPE_COURSE_ENROLLED,
        self::TYPE_COURSE_PURCHASED,
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_read' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}
