<?php

namespace App\Http\Controllers;

use App\Enums\PrintPaperSize;
use App\Enums\PrintServiceType;
use App\Models\PrintTransaction;
use App\Support\PrintPriceSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrintPageController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('print.view'), 403);

        $dateFrom = Carbon::parse($request->input('date_from', today()->toDateString()))->startOfDay();
        $dateTo = Carbon::parse($request->input('date_to', today()->toDateString()))->endOfDay();

        if ($dateTo->lt($dateFrom)) {
            $dateTo = $dateFrom->copy()->endOfDay();
        }

        $periodRevenue = (int) PrintTransaction::query()
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->sum('total_amount');

        $periodCount = (int) PrintTransaction::query()
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->count();

        $periodPages = (int) PrintTransaction::query()
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->sum('pages');

        $recentTransactions = PrintTransaction::with('user:id,name')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (PrintTransaction $t) => [
                'id' => $t->id,
                'service_type' => $t->service_type->value,
                'service_label' => $t->service_type->label(),
                'paper_size' => $t->paper_size->value,
                'paper_label' => $t->paper_size->label(),
                'pages' => $t->pages,
                'unit_price' => $t->unit_price,
                'total_amount' => $t->total_amount,
                'notes' => $t->notes,
                'user' => $t->user->name,
                'created_at' => $t->created_at,
            ])
            ->all();

        return Inertia::render('print/index', [
            'summary' => [
                'revenue' => $periodRevenue,
                'count' => $periodCount,
                'pages' => $periodPages,
            ],
            'dateFrom' => $dateFrom->toDateString(),
            'dateTo' => $dateTo->toDateString(),
            'recentTransactions' => $recentTransactions,
            'serviceTypes' => collect(PrintServiceType::cases())->map(fn (PrintServiceType $t) => [
                'value' => $t->value,
                'label' => $t->label(),
                'sizes' => collect(PrintPriceSchedule::sizesFor($t))->map(fn (string $size) => [
                    'value' => $size,
                    'label' => PrintPaperSize::from($size)->label(),
                    'price' => PrintPriceSchedule::priceFor($t, PrintPaperSize::from($size)),
                ])->values()->all(),
            ])->all(),
        ]);
    }
}
