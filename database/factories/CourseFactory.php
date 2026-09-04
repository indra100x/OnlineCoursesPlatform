<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 9.99, 199.99),
            'teacher_id' => User::factory()->teacher(),
        ];
    }

    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'price' => 0,
        ]);
    }
}
