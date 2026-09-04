<?php

namespace App\Events;

use App\Models\CoursePurchase;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CoursePurchased
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public CoursePurchase $purchase,
    ) {}
}
