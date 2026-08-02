<?php

use App\Models\Product;
use App\Models\Supplier;

test('syncing a single supplier price sets it as preferred and syncs the product', function () {
    $product = Product::factory()->create();
    $supplier = Supplier::factory()->create();

    $product->syncSupplierPrices([
        ['supplier_id' => $supplier->id, 'cost_price' => 25, 'is_preferred' => false],
    ]);

    $product->refresh();

    expect($product->supplierPrices)->toHaveCount(1)
        ->and($product->supplierPrices->first()->is_preferred)->toBeTrue()
        ->and($product->supplier_id)->toBe($supplier->id)
        ->and((float) $product->cost_price)->toBe(25.0);
});

test('only one supplier price can be preferred at a time', function () {
    $product = Product::factory()->create();
    $supplierA = Supplier::factory()->create();
    $supplierB = Supplier::factory()->create();

    $product->syncSupplierPrices([
        ['supplier_id' => $supplierA->id, 'cost_price' => 10, 'is_preferred' => true],
        ['supplier_id' => $supplierB->id, 'cost_price' => 12, 'is_preferred' => true],
    ]);

    $product->refresh();

    expect($product->supplierPrices()->where('is_preferred', true)->count())->toBe(1)
        ->and($product->supplier_id)->toBe($supplierA->id)
        ->and((float) $product->cost_price)->toBe(10.0);
});

test('switching the preferred supplier updates the product cost and supplier', function () {
    $product = Product::factory()->create();
    $supplierA = Supplier::factory()->create();
    $supplierB = Supplier::factory()->create();

    $product->syncSupplierPrices([
        ['supplier_id' => $supplierA->id, 'cost_price' => 10, 'is_preferred' => true],
        ['supplier_id' => $supplierB->id, 'cost_price' => 12, 'is_preferred' => false],
    ]);

    $product->syncSupplierPrices([
        ['supplier_id' => $supplierA->id, 'cost_price' => 10, 'is_preferred' => false],
        ['supplier_id' => $supplierB->id, 'cost_price' => 12, 'is_preferred' => true],
    ]);

    $product->refresh();

    expect($product->supplier_id)->toBe($supplierB->id)
        ->and((float) $product->cost_price)->toBe(12.0);
});

test('removing a supplier from the price list deletes its row', function () {
    $product = Product::factory()->create();
    $supplierA = Supplier::factory()->create();
    $supplierB = Supplier::factory()->create();

    $product->syncSupplierPrices([
        ['supplier_id' => $supplierA->id, 'cost_price' => 10, 'is_preferred' => true],
        ['supplier_id' => $supplierB->id, 'cost_price' => 12, 'is_preferred' => false],
    ]);

    $product->syncSupplierPrices([
        ['supplier_id' => $supplierB->id, 'cost_price' => 12, 'is_preferred' => true],
    ]);

    $product->refresh();

    expect($product->supplierPrices)->toHaveCount(1)
        ->and($product->supplierPrices->first()->supplier_id)->toBe($supplierB->id);
});

test('clearing the supplier price list resets the product cost and supplier', function () {
    $product = Product::factory()->create();
    $supplier = Supplier::factory()->create();

    $product->syncSupplierPrices([
        ['supplier_id' => $supplier->id, 'cost_price' => 10, 'is_preferred' => true],
    ]);

    $product->syncSupplierPrices([]);
    $product->refresh();

    expect($product->supplierPrices)->toHaveCount(0)
        ->and($product->supplier_id)->toBeNull()
        ->and((float) $product->cost_price)->toBe(0.0);
});
