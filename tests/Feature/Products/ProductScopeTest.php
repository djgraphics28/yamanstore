<?php

use App\Models\Product;

test('lowStock scope returns products at or below minimum but above zero', function () {
    $low = Product::factory()->create(['current_stock' => 5, 'minimum_stock' => 10]);
    Product::factory()->create(['current_stock' => 50, 'minimum_stock' => 10]);
    Product::factory()->create(['current_stock' => 0, 'minimum_stock' => 10]);

    $results = Product::lowStock()->get();

    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($low->id);
});

test('outOfStock scope returns products with zero or negative stock', function () {
    $outOfStock = Product::factory()->create(['current_stock' => 0, 'minimum_stock' => 10]);
    Product::factory()->create(['current_stock' => 5, 'minimum_stock' => 10]);

    $results = Product::outOfStock()->get();

    expect($results)->toHaveCount(1)
        ->and($results->first()->id)->toBe($outOfStock->id);
});

test('search scope matches name, sku, and barcode', function () {
    $product = Product::factory()->create([
        'name' => 'Coca-Cola 1.5L',
        'sku' => 'SKU-COKE',
        'barcode' => '4801234567890',
    ]);
    Product::factory()->create(['name' => 'Pepsi 1.5L', 'sku' => 'SKU-PEPSI', 'barcode' => '4809876543210']);

    expect(Product::search('Coca-Cola')->get())->toHaveCount(1);
    expect(Product::search('SKU-COKE')->get()->first()->id)->toBe($product->id);
    expect(Product::search('4801234567890')->get()->first()->id)->toBe($product->id);
    expect(Product::search(null)->get())->toHaveCount(2);
});
