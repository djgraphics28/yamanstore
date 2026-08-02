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
        ]);

        Role::firstOrCreate(['name' => 'Cashier', 'guard_name' => 'web']);

        $inventoryStaff = Role::firstOrCreate(['name' => 'Inventory Staff', 'guard_name' => 'web']);
        $inventoryStaff->syncPermissions([
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.view', 'categories.create', 'categories.update',
            'suppliers.view', 'suppliers.create', 'suppliers.update',
        ]);
    }
}
