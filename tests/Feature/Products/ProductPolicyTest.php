<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

function validProductPayload(Category $category, array $overrides = []): array
{
    return array_merge([
        'name' => 'Test Product',
        'sku' => 'SKU-'.uniqid(),
        'category_id' => $category->id,
        'selling_price' => 20,
        'unit' => 'pc',
        'current_stock' => 5,
        'minimum_stock' => 1,
        'status' => 'active',
    ], $overrides);
}

test('cashier cannot access product management', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $product = Product::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($cashier)->get(route('products.index'))->assertForbidden();
    $this->actingAs($cashier)->get(route('products.create'))->assertForbidden();
    $this->actingAs($cashier)
        ->post(route('products.store'), validProductPayload($category))
        ->assertForbidden();
    $this->actingAs($cashier)
        ->put(route('products.update', $product), validProductPayload($category))
        ->assertForbidden();
    $this->actingAs($cashier)->delete(route('products.destroy', $product))->assertForbidden();
    $this->actingAs($cashier)
        ->delete(route('products.bulk-destroy'), ['ids' => [$product->id]])
        ->assertForbidden();
});

test('inventory staff can create, update, and delete products', function () {
    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');
    $product = Product::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($inventoryStaff)->get(route('products.index'))->assertOk();
    $this->actingAs($inventoryStaff)
        ->post(route('products.store'), validProductPayload($category))
        ->assertSessionHasNoErrors();
    $this->actingAs($inventoryStaff)
        ->put(route('products.update', $product), validProductPayload($category))
        ->assertSessionHasNoErrors();
    $this->actingAs($inventoryStaff)
        ->delete(route('products.destroy', $product))
        ->assertRedirect(route('products.index'));
});

test('manager can create and update but not delete products', function () {
    $manager = User::factory()->create()->assignRole('Manager');
    $product = Product::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($manager)->get(route('products.index'))->assertOk();
    $this->actingAs($manager)
        ->post(route('products.store'), validProductPayload($category))
        ->assertSessionHasNoErrors();
    $this->actingAs($manager)->delete(route('products.destroy', $product))->assertForbidden();
});

test('administrator can do everything including delete products', function () {
    $administrator = User::factory()->create()->assignRole('Administrator');
    $product = Product::factory()->create();

    $this->actingAs($administrator)->get(route('products.index'))->assertOk();
    $this->actingAs($administrator)->delete(route('products.destroy', $product))->assertRedirect();
});
