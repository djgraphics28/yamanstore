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
                ->major()
                ->withCount('products')
                ->with(['children' => fn ($query) => $query->withCount('products')])
                ->orderBy('name')
                ->get()
                ->map(fn (Category $major) => [
                    'name' => $major->name,
                    'value' => $major->products_count + $major->children->sum('products_count'),
                ])
                ->filter(fn (array $row) => $row['value'] > 0)
                ->sortByDesc('value')
                ->values(),
        ]);
    }
}
