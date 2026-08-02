<?php

use App\Models\Category;
use Database\Seeders\CategorySeeder;

test('category seeder creates the default sari-sari store categories', function () {
    $this->seed(CategorySeeder::class);

    $expected = [
        'Drinks', 'Grocery', 'Canned Goods', 'Snacks', 'Biscuits',
        'Coffee', 'Noodles', 'Rice', 'Frozen Foods', 'School Supplies',
        'Toiletries', 'Cigarettes', 'Ice Cream', 'Bread', 'Eggs',
        'LPG', 'GCash', 'Mobile Load', 'Others',
    ];

    expect(Category::count())->toBe(19)
        ->and(Category::pluck('name')->sort()->values()->all())
        ->toBe(collect($expected)->sort()->values()->all());
});

test('re-running the category seeder does not duplicate categories', function () {
    $this->seed(CategorySeeder::class);
    $this->seed(CategorySeeder::class);

    expect(Category::count())->toBe(19);
});
