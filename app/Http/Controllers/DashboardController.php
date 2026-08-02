<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'lowStockCount' => Product::lowStock()->count(),
                'outOfStockCount' => Product::outOfStock()->count(),
                'totalProducts' => Product::count(),
                'totalCategories' => Category::count(),
            ],
            'categoryDistribution' => Category::query()
                ->withCount('products')
                ->get(['id', 'name'])
                ->filter(fn (Category $category) => $category->products_count > 0)
                ->sortByDesc('products_count')
                ->values()
                ->map(fn (Category $category) => [
                    'name' => $category->name,
                    'value' => $category->products_count,
                ]),
        ]);
    }
}
