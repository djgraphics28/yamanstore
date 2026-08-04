<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesPageController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('pos.view'), 403);

        $dateFrom = Carbon::parse($request->input('date_from', today()->toDateString()))->startOfDay();
        $dateTo = Carbon::parse($request->input('date_to', today()->toDateString()))->endOfDay();

        if ($dateTo->lt($dateFrom)) {
            $dateTo = $dateFrom->copy()->endOfDay();
        }

        $sales = Sale::with(['cashier:id,name', 'voidedByUser:id,name', 'items'])
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->latest()
            ->paginate(20)
            ->through(fn (Sale $s) => [
                'id' => $s->id,
                'reference_number' => $s->reference_number,
                'cashier' => $s->cashier->name,
                'subtotal' => (float) $s->subtotal,
                'discount' => (float) $s->discount,
                'total' => (float) $s->total,
                'amount_tendered' => (float) $s->amount_tendered,
                'change_due' => (float) $s->change_due,
                'payment_method' => $s->payment_method,
                'status' => $s->status,
                'voided_at' => $s->voided_at?->toDateTimeString(),
                'voided_by' => $s->voidedByUser?->name,
                'void_reason' => $s->void_reason,
                'notes' => $s->notes,
                'items' => $s->items->map(fn ($i) => [
                    'product_name' => $i->product_name,
                    'product_sku' => $i->product_sku,
                    'unit_price' => (float) $i->unit_price,
                    'quantity' => $i->quantity,
                    'discount' => (float) $i->discount,
                    'subtotal' => (float) $i->subtotal,
                ])->all(),
                'created_at' => $s->created_at->toDateTimeString(),
            ]);

        $stats = [
            'total_sales' => Sale::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', 'completed')->count(),
            'total_revenue' => (float) Sale::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', 'completed')->sum('total'),
            'total_voided' => Sale::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', 'voided')->count(),
        ];

        return Inertia::render('pos/sales', [
            'sales' => $sales,
            'stats' => $stats,
            'dateFrom' => $dateFrom->toDateString(),
            'dateTo' => $dateTo->toDateString(),
        ]);
    }
}
