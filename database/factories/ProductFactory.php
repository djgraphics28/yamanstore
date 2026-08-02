<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $costPrice = fake()->randomFloat(2, 5, 300);

        return [
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'barcode' => fake()->unique()->ean13(),
            'category_id' => Category::factory(),
            'brand' => fake()->optional()->company(),
            'supplier_id' => Supplier::factory(),
            'cost_price' => $costPrice,
            'selling_price' => $costPrice + fake()->randomFloat(2, 2, 50),
            'unit' => fake()->randomElement(['pc', 'pack', 'box', 'kg', 'sachet', 'bottle']),
            'current_stock' => fake()->numberBetween(0, 200),
            'minimum_stock' => fake()->numberBetween(5, 20),
            'expiration_date' => fake()->optional()->dateTimeBetween('now', '+1 year'),
            'image_path' => null,
            'status' => ProductStatus::Active,
        ];
    }
}
