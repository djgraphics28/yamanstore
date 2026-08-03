<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * @return Collection<int, array{id: int, name: string}>
     */
    private function categoryOptions(): Collection
    {
        return Category::query()
            ->with('parent')
            ->orderBy('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->parent ? "{$category->parent->name} / {$category->name}" : $category->name,
            ]);
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::query()
            ->with(['category', 'supplier'])
            ->search($request->string('search')->toString())
            ->when($request->integer('category_id'), function ($query, int $categoryId): void {
                $query->where('category_id', $categoryId);
            })
            ->when($request->string('status')->toString(), function ($query, string $status): void {
                $query->where('status', $status);
            })
            ->orderBy('name')
            ->paginate($this->perPage($request))
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products->through(fn (Product $product) => (new ProductResource($product))->resolve()),
            'categories' => $this->categoryOptions(),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'category_id' => $request->integer('category_id') ?: null,
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Product::class);

        return Inertia::render('products/create', [
            'categories' => $this->categoryOptions(),
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();
        $supplierPrices = $data['supplier_prices'] ?? [];
        unset($data['supplier_prices'], $data['image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($data, $supplierPrices): void {
            $product = Product::create($data);
            $product->syncSupplierPrices($supplierPrices);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created.')]);

        return to_route('products.index');
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        $product->load('supplierPrices.supplier');

        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => $this->categoryOptions(),
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $data = $request->validated();
        $supplierPrices = $data['supplier_prices'] ?? [];
        unset($data['supplier_prices'], $data['image']);

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($product, $data, $supplierPrices): void {
            $product->update($data);
            $product->syncSupplierPrices($supplierPrices);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product updated.')]);

        return to_route('products.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product deleted.')]);

        return to_route('products.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('products.delete'), 403);

        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:products,id'],
        ])['ids'];

        $count = Product::whereIn('id', $ids)->count();
        Product::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => trans_choice(':count product deleted.|:count products deleted.', $count, ['count' => $count])]);

        return to_route('products.index');
    }
}
