<?php

use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

test('cashier cannot access supplier management', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $supplier = Supplier::factory()->create();

    $this->actingAs($cashier)->get(route('suppliers.index'))->assertForbidden();
    $this->actingAs($cashier)->get(route('suppliers.create'))->assertForbidden();
    $this->actingAs($cashier)->post(route('suppliers.store'), ['name' => 'Test'])->assertForbidden();
    $this->actingAs($cashier)->put(route('suppliers.update', $supplier), ['name' => 'Test'])->assertForbidden();
    $this->actingAs($cashier)->delete(route('suppliers.destroy', $supplier))->assertForbidden();
    $this->actingAs($cashier)
        ->delete(route('suppliers.bulk-destroy'), ['ids' => [$supplier->id]])
        ->assertForbidden();
});

test('inventory staff can create and update but not delete suppliers', function () {
    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');
    $supplier = Supplier::factory()->create();

    $this->actingAs($inventoryStaff)->get(route('suppliers.index'))->assertOk();
    $this->actingAs($inventoryStaff)
        ->post(route('suppliers.store'), ['name' => 'New Supplier'])
        ->assertSessionHasNoErrors();
    $this->actingAs($inventoryStaff)
        ->put(route('suppliers.update', $supplier), ['name' => 'Updated'])
        ->assertSessionHasNoErrors();
    $this->actingAs($inventoryStaff)->delete(route('suppliers.destroy', $supplier))->assertForbidden();
});

test('manager can do everything except delete suppliers', function () {
    $manager = User::factory()->create()->assignRole('Manager');
    $supplier = Supplier::factory()->create();

    $this->actingAs($manager)->get(route('suppliers.index'))->assertOk();
    $this->actingAs($manager)
        ->post(route('suppliers.store'), ['name' => 'Manager Supplier'])
        ->assertSessionHasNoErrors();
    $this->actingAs($manager)->delete(route('suppliers.destroy', $supplier))->assertForbidden();
});

test('administrator can do everything including delete suppliers', function () {
    $administrator = User::factory()->create()->assignRole('Administrator');
    $supplier = Supplier::factory()->create();

    $this->actingAs($administrator)->get(route('suppliers.index'))->assertOk();
    $this->actingAs($administrator)->delete(route('suppliers.destroy', $supplier))->assertRedirect();
});
