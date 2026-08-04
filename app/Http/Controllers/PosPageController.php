<?php

namespace App\Http\Controllers;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosPageController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('pos.view'), 403);

        $products = Product::with('category:id,name')
            ->where('status', ProductStatus::Active)
            ->where('current_stock', '>', 0)
            ->orderBy('name')
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'barcode' => $p->barcode,
                'selling_price' => (float) $p->selling_price,
                'current_stock' => $p->current_stock,
                'category_id' => $p->category_id,
                'category' => $p->category?->name,
                'image_url' => $p->image_url,
            ]);

        $categories = Category::active()
            ->whereHas('products', fn ($q) => $q->where('status', ProductStatus::Active)->where('current_stock', '>', 0))
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('pos/index', compact('products', 'categories'));
    }
}
