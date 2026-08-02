<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Product::count() > 0) {
            return;
        }

        $supplierIds = Supplier::pluck('id');

        $products = [
            ['name' => 'Coca-Cola 1.5L', 'category' => 'Drinks', 'unit' => 'bottle', 'cost' => 45, 'price' => 65, 'stock' => 24, 'min' => 6],
            ['name' => 'Nescafe 3-in-1 Sachet', 'category' => 'Coffee', 'unit' => 'sachet', 'cost' => 6, 'price' => 9, 'stock' => 150, 'min' => 30],
            ['name' => 'Lucky Me Pancit Canton', 'category' => 'Noodles', 'unit' => 'pack', 'cost' => 12, 'price' => 16, 'stock' => 3, 'min' => 20],
            ['name' => 'Sky Flakes Crackers', 'category' => 'Biscuits', 'unit' => 'pack', 'cost' => 8, 'price' => 12, 'stock' => 40, 'min' => 15],
            ['name' => 'Piattos Cheese', 'category' => 'Snacks', 'unit' => 'pack', 'cost' => 20, 'price' => 28, 'stock' => 0, 'min' => 10],
            ['name' => 'Century Tuna Flakes in Oil', 'category' => 'Canned Goods', 'unit' => 'can', 'cost' => 28, 'price' => 38, 'stock' => 60, 'min' => 12],
            ['name' => 'Jasmine Rice', 'category' => 'Rice', 'unit' => 'kg', 'cost' => 48, 'price' => 55, 'stock' => 80, 'min' => 20],
            ['name' => 'Magnolia Fresh Eggs', 'category' => 'Eggs', 'unit' => 'pc', 'cost' => 7, 'price' => 9, 'stock' => 120, 'min' => 24],
            ['name' => 'Gardenia Classic White Bread', 'category' => 'Bread', 'unit' => 'pack', 'cost' => 55, 'price' => 68, 'stock' => 5, 'min' => 8],
            ['name' => 'Selecta Cornetto', 'category' => 'Ice Cream', 'unit' => 'pc', 'cost' => 25, 'price' => 35, 'stock' => 18, 'min' => 10],
            ['name' => 'CDO Corned Beef', 'category' => 'Canned Goods', 'unit' => 'can', 'cost' => 32, 'price' => 42, 'stock' => 45, 'min' => 12],
            ['name' => 'Marlboro Red Pack', 'category' => 'Cigarettes', 'unit' => 'pack', 'cost' => 130, 'price' => 150, 'stock' => 30, 'min' => 10],
            ['name' => 'Safeguard Bar Soap', 'category' => 'Toiletries', 'unit' => 'pc', 'cost' => 20, 'price' => 28, 'stock' => 50, 'min' => 15],
            ['name' => 'Colgate Toothpaste 150g', 'category' => 'Toiletries', 'unit' => 'pc', 'cost' => 55, 'price' => 72, 'stock' => 25, 'min' => 10],
            ['name' => 'Solane LPG Refill 11kg', 'category' => 'LPG', 'unit' => 'tank', 'cost' => 850, 'price' => 950, 'stock' => 4, 'min' => 3],
            ['name' => 'Yosi Stick Fortune', 'category' => 'Cigarettes', 'unit' => 'stick', 'cost' => 4, 'price' => 6, 'stock' => 200, 'min' => 50],
            ['name' => 'Mongol Pencil #2', 'category' => 'School Supplies', 'unit' => 'pc', 'cost' => 5, 'price' => 8, 'stock' => 100, 'min' => 20],
            ['name' => 'Spiral Notebook 80 Leaves', 'category' => 'School Supplies', 'unit' => 'pc', 'cost' => 18, 'price' => 25, 'stock' => 35, 'min' => 10],
            ['name' => 'Frozen Chicken Nuggets 500g', 'category' => 'Frozen Foods', 'unit' => 'pack', 'cost' => 95, 'price' => 120, 'stock' => 10, 'min' => 8],
            ['name' => 'Great Taste White Coffee', 'category' => 'Coffee', 'unit' => 'sachet', 'cost' => 5, 'price' => 8, 'stock' => 180, 'min' => 40],
        ];

        foreach ($products as $index => $item) {
            $category = Category::where('name', $item['category'])->first();

            if (! $category) {
                continue;
            }

            $product = Product::create([
                'name' => $item['name'],
                'sku' => 'SKU-'.str_pad((string) ($index + 1), 5, '0', STR_PAD_LEFT),
                'barcode' => '480'.str_pad((string) ($index + 1), 10, '0', STR_PAD_LEFT),
                'category_id' => $category->id,
                'brand' => null,
                'selling_price' => $item['price'],
                'unit' => $item['unit'],
                'current_stock' => $item['stock'],
                'minimum_stock' => $item['min'],
                'expiration_date' => null,
                'status' => ProductStatus::Active,
            ]);

            if ($supplierIds->isEmpty()) {
                continue;
            }

            $supplierPrices = [[
                'supplier_id' => $supplierIds->random(),
                'cost_price' => $item['cost'],
                'is_preferred' => true,
            ]];

            // Give every third product a second supplier at a slightly different
            // price, to demonstrate comparing costs across suppliers.
            if ($index % 3 === 0 && $supplierIds->count() > 1) {
                $altSupplierId = $supplierIds->first(fn ($id) => $id !== $supplierPrices[0]['supplier_id']);

                if ($altSupplierId) {
                    $supplierPrices[] = [
                        'supplier_id' => $altSupplierId,
                        'cost_price' => round($item['cost'] * 1.05, 2),
                        'is_preferred' => false,
                    ];
                }
            }

            $product->syncSupplierPrices($supplierPrices);
        }
    }
}
