<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Drinks', 'Grocery', 'Canned Goods', 'Snacks', 'Biscuits',
            'Coffee', 'Noodles', 'Rice', 'Frozen Foods', 'School Supplies',
            'Toiletries', 'Cigarettes', 'Ice Cream', 'Bread', 'Eggs',
            'LPG', 'GCash', 'Mobile Load', 'Others',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name), 'is_active' => true],
            );
        }
    }
}
