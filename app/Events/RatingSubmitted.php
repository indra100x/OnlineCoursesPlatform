<?php

namespace App\Events;

use App\Models\CourseRating;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RatingSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public CourseRating $rating,
    ) {}
}
