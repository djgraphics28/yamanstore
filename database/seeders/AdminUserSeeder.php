<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        $user = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@yamanstore.com',
        ]);

        $user->assignRole('Administrator');
    }
}
