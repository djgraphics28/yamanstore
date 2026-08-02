<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductSupplierPrice;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductSupplierPrice>
 */
class ProductSupplierPriceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'supplier_id' => Supplier::factory(),
            'cost_price' => fake()->randomFloat(2, 5, 300),
            'is_preferred' => true,
        ];
    }
}
