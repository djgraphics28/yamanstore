<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            ['name' => 'Savewise', 'address' => 'Pozorrubio'],
            ['name' => 'CSI', 'address' => 'Urdaneta City'],
            ['name' => 'Anabelle Grocery', 'address' => 'Binalonan'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(
                ['name' => $supplier['name']],
                ['address' => $supplier['address'], 'is_active' => true],
            );
        }
    }
}
