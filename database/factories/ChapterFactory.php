<?php

namespace Database\Factories;

use App\Models\Chapter;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chapter>
 */
class ChapterFactory extends Factory
{
    protected $model = Chapter::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => fake()->sentence(3),
            'position' => fake()->numberBetween(1, 20),
            'file_path' => 'chapters/'.fake()->uuid().'.pdf',
            'file_name' => fake()->word().'.pdf',
            'file_size' => fake()->numberBetween(1000, 50000000),
        ];
    }
}
