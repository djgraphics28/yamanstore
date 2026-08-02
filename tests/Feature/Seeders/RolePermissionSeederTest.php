<?php

use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('permission seeder creates the four roles', function () {
    $this->seed(PermissionSeeder::class);

    expect(Role::pluck('name')->sort()->values()->all())
        ->toBe(['Administrator', 'Cashier', 'Inventory Staff', 'Manager']);
});

test('administrator role has every permission', function () {
    $this->seed(PermissionSeeder::class);

    $administrator = Role::findByName('Administrator');

    expect($administrator->permissions()->count())->toBe(Permission::count());
});

test('cashier role has no admin permissions in phase 1', function () {
    $this->seed(PermissionSeeder::class);

    $cashier = Role::findByName('Cashier');

    expect($cashier->permissions()->count())->toBe(0);
});

test('inventory staff can delete products but not categories or suppliers', function () {
    $this->seed(PermissionSeeder::class);

    $inventoryStaff = Role::findByName('Inventory Staff');

    expect($inventoryStaff->hasPermissionTo('products.delete'))->toBeTrue()
        ->and($inventoryStaff->hasPermissionTo('categories.delete'))->toBeFalse()
        ->and($inventoryStaff->hasPermissionTo('suppliers.delete'))->toBeFalse();
});

test('manager role cannot delete or manage settings', function () {
    $this->seed(PermissionSeeder::class);

    $manager = Role::findByName('Manager');

    expect($manager->hasPermissionTo('products.delete'))->toBeFalse()
        ->and($manager->hasPermissionTo('categories.delete'))->toBeFalse()
        ->and($manager->hasPermissionTo('suppliers.delete'))->toBeFalse()
        ->and($manager->hasPermissionTo('settings.manage'))->toBeFalse()
        ->and($manager->hasPermissionTo('products.view'))->toBeTrue();
});

test('re-running the seeder does not duplicate roles or permissions', function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(PermissionSeeder::class);

    expect(Role::count())->toBe(4)
        ->and(Permission::count())->toBe(13);
});
