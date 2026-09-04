<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'student_id' => User::factory()->student(),
            'course_id' => Course::factory(),
            'enrolled_at' => now(),
        ];
    }
}
