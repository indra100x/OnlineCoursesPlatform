<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@courses.test'],
            [
                'name' => 'Platform Admin',
                'role' => User::ROLE_ADMIN,
                'password' => Hash::make('AdminPass123!'),
                'email_verified_at' => now(),
            ],
        );
    }
}
