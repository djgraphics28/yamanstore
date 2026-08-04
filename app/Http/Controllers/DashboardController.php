<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\GcashTransaction;
use App\Models\LoadTransaction;
use App\Models\PrintTransaction;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $dateFrom = Carbon::parse($request->input('date_from', today()->toDateString()))->startOfDay();
        $dateTo   = Carbon::parse($request->input('date_to',   today()->toDateString()))->endOfDay();

        if ($dateTo->lt($dateFrom)) {
            $dateTo = $dateFrom->copy()->endOfDay();
        }

        // POS
        $salesBase = Sale::whereBetween('created_at', [$dateFrom, $dateTo]);

        // GCash
        $cashIn  = GcashTransaction::whereBetween('created_at', [$dateFrom, $dateTo])->where('type', 'cash_in');
        $cashOut = GcashTransaction::whereBetween('created_at', [$dateFrom, $dateTo])->where('type', 'cash_out');
        $load    = LoadTransaction::whereBetween('created_at', [$dateFrom, $dateTo]);

        // Print
        $print = PrintTransaction::whereBetween('created_at', [$dateFrom, $dateTo]);

        // Daily sales trend for the period
        $salesTrend = Sale::selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'completed')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date'    => $r->date,
                'revenue' => (float) $r->revenue,
                'count'   => (int) $r->count,
            ])
            ->values();

        // Best selling products in period
        $completedSaleIds = Sale::whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'completed')
            ->pluck('id');

        $bestSelling = SaleItem::whereIn('sale_id', $completedSaleIds)
            ->selectRaw('product_name, SUM(quantity) as qty, SUM(subtotal) as revenue')
            ->groupBy('product_name')
            ->orderByDesc('qty')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'name'    => $r->product_name,
                'qty'     => (int) $r->qty,
                'revenue' => (float) $r->revenue,
            ])
            ->values();

        return Inertia::render('dashboard', [
            'pos' => [
                'revenue' => (float) (clone $salesBase)->where('status', 'completed')->sum('total'),
                'count'   => (clone $salesBase)->where('status', 'completed')->count(),
                'voided'  => (clone $salesBase)->where('status', 'voided')->count(),
            ],
            'gcash' => [
                'cashIn'  => [
                    'amount' => (float) (clone $cashIn)->sum('amount'),
                    'fees'   => (float) (clone $cashIn)->sum('service_fee'),
                    'count'  => (clone $cashIn)->count(),
                ],
                'cashOut' => [
                    'amount' => (float) (clone $cashOut)->sum('amount'),
                    'fees'   => (float) (clone $cashOut)->sum('service_fee'),
                    'count'  => (clone $cashOut)->count(),
                ],
                'load'    => [
                    'amount' => (float) (clone $load)->sum('amount'),
                    'fees'   => (float) (clone $load)->sum('service_fee'),
                    'count'  => (clone $load)->count(),
                ],
            ],
            'print' => [
                'revenue' => (float) (clone $print)->sum('total_amount'),
                'count'   => (clone $print)->count(),
                'pages'   => (int)   (clone $print)->sum('pages'),
            ],
            'inventory' => [
                'lowStockCount'   => Product::lowStock()->count(),
                'outOfStockCount' => Product::outOfStock()->count(),
                'totalProducts'   => Product::count(),
                'totalCategories' => Category::count(),
            ],
            'categoryDistribution' => Category::query()
                ->major()
                ->withCount('products')
                ->with(['children' => fn ($q) => $q->withCount('products')])
                ->orderBy('name')
                ->get()
                ->map(fn (Category $c) => [
                    'name'  => $c->name,
                    'value' => $c->products_count + $c->children->sum('products_count'),
                ])
                ->filter(fn ($r) => $r['value'] > 0)
                ->sortByDesc('value')
                ->values(),
            'salesTrend'  => $salesTrend,
            'bestSelling' => $bestSelling,
            'dateFrom'    => $dateFrom->toDateString(),
            'dateTo'      => $dateTo->toDateString(),
        ]);
    }
}
