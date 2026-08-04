<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            'categories.view',
            'categories.create',
            'categories.update',
            'categories.delete',
            'suppliers.view',
            'suppliers.create',
            'suppliers.update',
            'suppliers.delete',
            'gcash.view',
            'gcash.create',
            'gcash.update',
            'gcash.delete',
            'print.view',
            'print.create',
            'print.update',
            'print.delete',
            'pos.view',
            'pos.create',
            'pos.void',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.manage',
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $administrator = Role::firstOrCreate(['name' => 'Administrator', 'guard_name' => 'web']);
        $administrator->syncPermissions(Permission::all());

        $manager = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
        $manager->syncPermissions([
            'products.view', 'products.create', 'products.update',
            'categories.view', 'categories.create', 'categories.update',
            'suppliers.view', 'suppliers.create', 'suppliers.update',
            'gcash.view', 'gcash.create', 'gcash.update',
            'pos.view', 'pos.create', 'pos.void',
        ]);

        $cashier = Role::firstOrCreate(['name' => 'Cashier', 'guard_name' => 'web']);
        $cashier->syncPermissions([
            'gcash.view', 'gcash.create', 'gcash.update',
            'pos.view', 'pos.create',
        ]);

        $inventoryStaff = Role::firstOrCreate(['name' => 'Inventory Staff', 'guard_name' => 'web']);
        $inventoryStaff->syncPermissions([
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.view', 'categories.create', 'categories.update',
            'suppliers.view', 'suppliers.create', 'suppliers.update',
        ]);
    }
}
