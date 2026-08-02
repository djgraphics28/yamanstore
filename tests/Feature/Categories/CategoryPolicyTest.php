<?php

use App\Models\Category;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

test('cashier cannot access category management', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $category = Category::factory()->create();

    $this->actingAs($cashier)->get(route('categories.index'))->assertForbidden();
    $this->actingAs($cashier)->get(route('categories.create'))->assertForbidden();
    $this->actingAs($cashier)->post(route('categories.store'), ['name' => 'Test'])->assertForbidden();
    $this->actingAs($cashier)->put(route('categories.update', $category), ['name' => 'Test'])->assertForbidden();
    $this->actingAs($cashier)->delete(route('categories.destroy', $category))->assertForbidden();
    $this->actingAs($cashier)
        ->delete(route('categories.bulk-destroy'), ['ids' => [$category->id]])
        ->assertForbidden();
});

test('inventory staff can create and update but not delete categories', function () {
    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');
    $category = Category::factory()->create();

    $this->actingAs($inventoryStaff)->get(route('categories.index'))->assertOk();
    $this->actingAs($inventoryStaff)
        ->post(route('categories.store'), ['name' => 'New Category'])
        ->assertSessionHasNoErrors();
    $this->actingAs($inventoryStaff)
        ->put(route('categories.update', $category), ['name' => 'Updated'])
        ->assertSessionHasNoErrors();
    $this->actingAs($inventoryStaff)->delete(route('categories.destroy', $category))->assertForbidden();
});

test('manager can do everything except delete categories', function () {
    $manager = User::factory()->create()->assignRole('Manager');
    $category = Category::factory()->create();

    $this->actingAs($manager)->get(route('categories.index'))->assertOk();
    $this->actingAs($manager)
        ->post(route('categories.store'), ['name' => 'Manager Category'])
        ->assertSessionHasNoErrors();
    $this->actingAs($manager)
        ->put(route('categories.update', $category), ['name' => 'Updated by Manager'])
        ->assertSessionHasNoErrors();
    $this->actingAs($manager)->delete(route('categories.destroy', $category))->assertForbidden();
});

test('administrator can do everything including delete categories', function () {
    $administrator = User::factory()->create()->assignRole('Administrator');
    $category = Category::factory()->create();

    $this->actingAs($administrator)->get(route('categories.index'))->assertOk();
    $this->actingAs($administrator)->delete(route('categories.destroy', $category))->assertRedirect();
});
