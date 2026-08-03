<?php

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\CategorySeeder;

test('category seeder creates 3 major categories with the remaining categories nested under Groceries', function () {
    $this->seed(CategorySeeder::class);

    expect(Category::count())->toBe(18);

    $majors = Category::query()->major()->pluck('name')->sort()->values()->all();
    expect($majors)->toBe(['Drinks', 'Groceries', 'School Supplies']);

    $groceries = Category::where('name', 'Groceries')->firstOrFail();
    $expectedChildren = [
        'Grocery', 'Canned Goods', 'Snacks', 'Biscuits', 'Coffee', 'Noodles',
        'Rice', 'Frozen Foods', 'Toiletries', 'Cigarettes', 'Ice Cream',
        'Bread', 'Eggs', 'LPG', 'Others',
    ];

    expect($groceries->children()->pluck('name')->sort()->values()->all())
        ->toBe(collect($expectedChildren)->sort()->values()->all())
        ->and(Category::where('name', 'Drinks')->value('parent_id'))->toBeNull()
        ->and(Category::where('name', 'School Supplies')->value('parent_id'))->toBeNull();
});

test('category seeder removes GCash and Mobile Load as product categories', function () {
    $this->seed(CategorySeeder::class);

    expect(Category::whereIn('name', ['GCash', 'Mobile Load'])->count())->toBe(0);
});

test('category seeder does not delete GCash or Mobile Load if a product still references them', function () {
    $gcash = Category::factory()->create(['name' => 'GCash']);
    Product::factory()->create(['category_id' => $gcash->id]);

    $this->seed(CategorySeeder::class);

    $this->assertDatabaseHas('categories', ['name' => 'GCash', 'deleted_at' => null]);
});

test('re-running the category seeder does not duplicate categories', function () {
    $this->seed(CategorySeeder::class);
    $this->seed(CategorySeeder::class);

    expect(Category::count())->toBe(18);
});
