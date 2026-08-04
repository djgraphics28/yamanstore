<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('pos.create'), 403);

        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,gcash'],
            'amount_tendered' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $sale = DB::transaction(function () use ($data, $request) {
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $itemDiscount = $item['discount'] ?? 0;
                $subtotal += ($item['unit_price'] * $item['quantity']) - $itemDiscount;
            }

            $overallDiscount = $data['discount'] ?? 0;
            $total = max(0, $subtotal - $overallDiscount);
            $tendered = $data['amount_tendered'];
            $changeDue = $data['payment_method'] === 'cash' ? max(0, $tendered - $total) : 0;

            $sale = Sale::create([
                'reference_number' => Sale::generateReference(),
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'discount' => $overallDiscount,
                'total' => $total,
                'amount_tendered' => $tendered,
                'change_due' => $changeDue,
                'payment_method' => $data['payment_method'],
                'status' => 'completed',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $itemDiscount = $item['discount'] ?? 0;
                $sale->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'discount' => $itemDiscount,
                    'subtotal' => ($item['unit_price'] * $item['quantity']) - $itemDiscount,
                ]);
                $product->decrement('current_stock', $item['quantity']);
            }

            return $sale->load('items', 'cashier:id,name');
        });

        Inertia::flash('sale', [
            'id' => $sale->id,
            'reference_number' => $sale->reference_number,
            'cashier' => $sale->cashier->name,
            'subtotal' => (float) $sale->subtotal,
            'discount' => (float) $sale->discount,
            'total' => (float) $sale->total,
            'amount_tendered' => (float) $sale->amount_tendered,
            'change_due' => (float) $sale->change_due,
            'payment_method' => $sale->payment_method,
            'items' => $sale->items->map(fn ($i) => [
                'product_name' => $i->product_name,
                'product_sku' => $i->product_sku,
                'unit_price' => (float) $i->unit_price,
                'quantity' => $i->quantity,
                'discount' => (float) $i->discount,
                'subtotal' => (float) $i->subtotal,
            ])->all(),
            'created_at' => $sale->created_at->toDateTimeString(),
        ]);

        return to_route('pos.index');
    }

    public function void(Sale $sale, Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('pos.void'), 403);
        abort_if($sale->status === 'voided', 422, 'Already voided.');

        $data = $request->validate([
            'void_reason' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($sale, $data, $request) {
            $sale->update([
                'status' => 'voided',
                'voided_at' => now(),
                'voided_by' => $request->user()->id,
                'void_reason' => $data['void_reason'],
            ]);

            foreach ($sale->items as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('current_stock', $item->quantity);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Sale {$sale->reference_number} has been voided."]);

        return back();
    }
}
