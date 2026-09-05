<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wishlist>
 */
class WishlistFactory extends Factory
{
    protected $model = Wishlist::class;

    public function definition(): array
    {
        return [
            'student_id' => User::factory()->student(),
            'course_id' => Course::factory(),
        ];
    }
}
