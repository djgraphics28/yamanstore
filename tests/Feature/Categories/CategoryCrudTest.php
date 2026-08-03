<?php

use App\Models\Category;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->admin = User::factory()->create()->assignRole('Administrator');
});

test('administrator can view the categories index', function () {
    Category::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('categories.index'));

    $response->assertOk();
});

test('administrator can create a category', function () {
    $response = $this->actingAs($this->admin)->post(route('categories.store'), [
        'name' => 'Beverages',
        'description' => 'Cold and hot drinks',
        'is_active' => true,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Beverages',
        'slug' => 'beverages',
    ]);
});

test('creating a category with a duplicate name fails validation', function () {
    Category::factory()->create(['name' => 'Snacks']);

    $response = $this->actingAs($this->admin)->post(route('categories.store'), [
        'name' => 'Snacks',
    ]);

    $response->assertSessionHasErrors('name');
});

test('administrator can update a category', function () {
    $category = Category::factory()->create(['name' => 'Old Name']);

    $response = $this->actingAs($this->admin)->put(route('categories.update', $category), [
        'name' => 'New Name',
        'description' => null,
        'is_active' => false,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categories.index'));

    $category->refresh();
    expect($category->name)->toBe('New Name')
        ->and($category->is_active)->toBeFalse();
});

test('administrator can delete a category', function () {
    $category = Category::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('categories.destroy', $category));

    $response->assertRedirect(route('categories.index'));

    $this->assertSoftDeleted($category);
});

test('administrator can bulk delete categories', function () {
    $categories = Category::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->delete(route('categories.bulk-destroy'), [
        'ids' => $categories->pluck('id')->all(),
    ]);

    $response->assertRedirect(route('categories.index'));

    foreach ($categories as $category) {
        $this->assertSoftDeleted($category);
    }
});

test('bulk deleting categories requires at least one id', function () {
    $response = $this->actingAs($this->admin)->delete(route('categories.bulk-destroy'), [
        'ids' => [],
    ]);

    $response->assertSessionHasErrors('ids');
});

test('administrator can create a category nested under a major category', function () {
    $major = Category::factory()->create(['parent_id' => null]);

    $response = $this->actingAs($this->admin)->post(route('categories.store'), [
        'name' => 'Instant Noodles',
        'parent_id' => $major->id,
        'is_active' => true,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Instant Noodles',
        'parent_id' => $major->id,
    ]);
});

test('administrator can update a category to reassign its parent', function () {
    $major = Category::factory()->create(['parent_id' => null]);
    $category = Category::factory()->create(['parent_id' => null]);

    $response = $this->actingAs($this->admin)->put(route('categories.update', $category), [
        'name' => $category->name,
        'parent_id' => $major->id,
        'is_active' => true,
    ]);

    $response->assertSessionHasNoErrors();

    expect($category->refresh()->parent_id)->toBe($major->id);
});
