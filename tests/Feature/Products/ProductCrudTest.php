<?php

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->admin = User::factory()->create()->assignRole('Administrator');
});

test('administrator can view the products index', function () {
    Product::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('products.index'));

    $response->assertOk();
});

test('administrator can create a product with an image and a supplier price', function () {
    Storage::fake('public');

    $category = Category::factory()->create();
    $supplier = Supplier::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('products.store'), [
        'name' => 'Coca-Cola 1.5L',
        'sku' => 'SKU-00001',
        'barcode' => '4801234567890',
        'category_id' => $category->id,
        'brand' => 'Coca-Cola',
        'selling_price' => 65,
        'unit' => 'bottle',
        'current_stock' => 24,
        'minimum_stock' => 6,
        'status' => 'active',
        'image' => UploadedFile::fake()->image('product.jpg'),
        'supplier_prices' => [
            ['supplier_id' => $supplier->id, 'cost_price' => 45, 'is_preferred' => true],
        ],
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('products.index'));

    $product = Product::where('sku', 'SKU-00001')->firstOrFail();
    expect($product->image_path)->not->toBeNull();
    expect((float) $product->cost_price)->toBe(45.0);
    expect($product->supplier_id)->toBe($supplier->id);
    Storage::disk('public')->assertExists($product->image_path);

    $this->assertDatabaseHas('product_supplier_prices', [
        'product_id' => $product->id,
        'supplier_id' => $supplier->id,
        'is_preferred' => true,
    ]);
});

test('a product can have multiple supplier prices with one preferred', function () {
    $category = Category::factory()->create();
    $supplierA = Supplier::factory()->create();
    $supplierB = Supplier::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('products.store'), [
        'name' => 'Multi Supplier Product',
        'sku' => 'SKU-MULTI',
        'category_id' => $category->id,
        'selling_price' => 20,
        'unit' => 'pc',
        'current_stock' => 5,
        'minimum_stock' => 1,
        'status' => 'active',
        'supplier_prices' => [
            ['supplier_id' => $supplierA->id, 'cost_price' => 10, 'is_preferred' => false],
            ['supplier_id' => $supplierB->id, 'cost_price' => 12, 'is_preferred' => true],
        ],
    ]);

    $response->assertSessionHasNoErrors();

    $product = Product::where('sku', 'SKU-MULTI')->firstOrFail();

    expect($product->supplierPrices)->toHaveCount(2)
        ->and((float) $product->cost_price)->toBe(12.0)
        ->and($product->supplier_id)->toBe($supplierB->id);

    $this->assertDatabaseHas('product_supplier_prices', [
        'product_id' => $product->id,
        'supplier_id' => $supplierA->id,
        'is_preferred' => false,
    ]);
    $this->assertDatabaseHas('product_supplier_prices', [
        'product_id' => $product->id,
        'supplier_id' => $supplierB->id,
        'is_preferred' => true,
    ]);
});

test('creating a product with a duplicate sku fails validation', function () {
    $category = Category::factory()->create();
    Product::factory()->create(['sku' => 'SKU-DUPLICATE', 'category_id' => $category->id]);

    $response = $this->actingAs($this->admin)->post(route('products.store'), [
        'name' => 'Another Product',
        'sku' => 'SKU-DUPLICATE',
        'category_id' => $category->id,
        'selling_price' => 20,
        'unit' => 'pc',
        'current_stock' => 5,
        'minimum_stock' => 1,
        'status' => 'active',
    ]);

    $response->assertSessionHasErrors('sku');
});

test('creating a product without a category fails validation', function () {
    $response = $this->actingAs($this->admin)->post(route('products.store'), [
        'name' => 'No Category Product',
        'sku' => 'SKU-NOCAT',
        'selling_price' => 20,
        'unit' => 'pc',
        'current_stock' => 5,
        'minimum_stock' => 1,
        'status' => 'active',
    ]);

    $response->assertSessionHasErrors('category_id');
});

test('creating a product with a negative supplier cost price fails validation', function () {
    $category = Category::factory()->create();
    $supplier = Supplier::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('products.store'), [
        'name' => 'Negative Price Product',
        'sku' => 'SKU-NEG',
        'category_id' => $category->id,
        'selling_price' => 20,
        'unit' => 'pc',
        'current_stock' => 5,
        'minimum_stock' => 1,
        'status' => 'active',
        'supplier_prices' => [
            ['supplier_id' => $supplier->id, 'cost_price' => -5, 'is_preferred' => true],
        ],
    ]);

    $response->assertSessionHasErrors('supplier_prices.0.cost_price');
});

test('creating a product with the same supplier twice fails validation', function () {
    $category = Category::factory()->create();
    $supplier = Supplier::factory()->create();

    $response = $this->actingAs($this->admin)->post(route('products.store'), [
        'name' => 'Duplicate Supplier Product',
        'sku' => 'SKU-DUPSUP',
        'category_id' => $category->id,
        'selling_price' => 20,
        'unit' => 'pc',
        'current_stock' => 5,
        'minimum_stock' => 1,
        'status' => 'active',
        'supplier_prices' => [
            ['supplier_id' => $supplier->id, 'cost_price' => 10, 'is_preferred' => true],
            ['supplier_id' => $supplier->id, 'cost_price' => 11, 'is_preferred' => false],
        ],
    ]);

    $response->assertSessionHasErrors('supplier_prices.0.supplier_id');
});

test('administrator can update a product and switch the preferred supplier', function () {
    $product = Product::factory()->create(['name' => 'Old Name']);
    $supplierA = Supplier::factory()->create();
    $supplierB = Supplier::factory()->create();

    $response = $this->actingAs($this->admin)->put(route('products.update', $product), [
        'name' => 'New Name',
        'sku' => $product->sku,
        'category_id' => $product->category_id,
        'selling_price' => $product->selling_price,
        'unit' => $product->unit,
        'current_stock' => 10,
        'minimum_stock' => 2,
        'status' => 'inactive',
        'supplier_prices' => [
            ['supplier_id' => $supplierA->id, 'cost_price' => 15, 'is_preferred' => false],
            ['supplier_id' => $supplierB->id, 'cost_price' => 18, 'is_preferred' => true],
        ],
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('products.index'));

    $product->refresh();
    expect($product->name)->toBe('New Name')
        ->and($product->current_stock)->toBe(10)
        ->and($product->status)->toBe(ProductStatus::Inactive)
        ->and($product->supplier_id)->toBe($supplierB->id)
        ->and((float) $product->cost_price)->toBe(18.0);
});

test('administrator can delete a product', function () {
    $product = Product::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('products.destroy', $product));

    $response->assertRedirect(route('products.index'));

    $this->assertSoftDeleted($product);
});

test('administrator can bulk delete products', function () {
    $products = Product::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->delete(route('products.bulk-destroy'), [
        'ids' => $products->pluck('id')->all(),
    ]);

    $response->assertRedirect(route('products.index'));

    foreach ($products as $product) {
        $this->assertSoftDeleted($product);
    }
});

test('bulk deleting products requires at least one id', function () {
    $response = $this->actingAs($this->admin)->delete(route('products.bulk-destroy'), [
        'ids' => [],
    ]);

    $response->assertSessionHasErrors('ids');
});
