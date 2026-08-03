<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->admin = User::factory()->create()->assignRole('Administrator');
});

test('a category cannot be nested under a category that is itself a child (no grandchildren)', function () {
    $major = Category::factory()->create(['parent_id' => null]);
    $child = Category::factory()->create(['parent_id' => $major->id]);

    $response = $this->actingAs($this->admin)->post(route('categories.store'), [
        'name' => 'Grandchild',
        'parent_id' => $child->id,
        'is_active' => true,
    ]);

    $response->assertSessionHasErrors('parent_id');
});

test('a category cannot be its own parent', function () {
    $category = Category::factory()->create(['parent_id' => null]);

    $response = $this->actingAs($this->admin)->put(route('categories.update', $category), [
        'name' => $category->name,
        'parent_id' => $category->id,
        'is_active' => true,
    ]);

    $response->assertSessionHasErrors('parent_id');
});

test('a major category with children cannot be nested under another category', function () {
    $otherMajor = Category::factory()->create(['parent_id' => null]);
    $majorWithChildren = Category::factory()->create(['parent_id' => null]);
    Category::factory()->create(['parent_id' => $majorWithChildren->id]);

    $response = $this->actingAs($this->admin)->put(route('categories.update', $majorWithChildren), [
        'name' => $majorWithChildren->name,
        'parent_id' => $otherMajor->id,
        'is_active' => true,
    ]);

    $response->assertSessionHasErrors('parent_id');
});

test('dashboard category distribution rolls up product counts to the major category', function () {
    $groceries = Category::factory()->create(['name' => 'Groceries', 'parent_id' => null]);
    $snacks = Category::factory()->create(['name' => 'Snacks', 'parent_id' => $groceries->id]);
    $drinks = Category::factory()->create(['name' => 'Drinks', 'parent_id' => null]);

    Product::factory()->count(2)->create(['category_id' => $groceries->id]);
    Product::factory()->count(3)->create(['category_id' => $snacks->id]);
    Product::factory()->count(1)->create(['category_id' => $drinks->id]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('categoryDistribution.0.name', 'Groceries')
        ->where('categoryDistribution.0.value', 5)
        ->where('categoryDistribution.1.name', 'Drinks')
        ->where('categoryDistribution.1.value', 1)
    );
});
