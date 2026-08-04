<?php

namespace App\Http\Controllers;

use App\Enums\PrintPaperSize;
use App\Enums\PrintServiceType;
use App\Http\Requests\StorePrintTransactionRequest;
use App\Http\Requests\UpdatePrintTransactionRequest;
use App\Models\PrintTransaction;
use App\Support\PrintPriceSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PrintTransactionController extends Controller
{
    public function store(StorePrintTransactionRequest $request): RedirectResponse
    {
        $this->authorize('create', PrintTransaction::class);

        $data = $request->validated();
        $serviceType = PrintServiceType::from($data['service_type']);
        $paperSize = PrintPaperSize::from($data['paper_size']);
        $unitPrice = PrintPriceSchedule::priceFor($serviceType, $paperSize);

        PrintTransaction::create([
            ...$data,
            'unit_price' => $unitPrice,
            'total_amount' => $unitPrice * $data['pages'],
            'user_id' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Print job recorded.')]);

        return to_route('print.index');
    }

    public function update(UpdatePrintTransactionRequest $request, PrintTransaction $printTransaction): RedirectResponse
    {
        $this->authorize('update', $printTransaction);

        $data = $request->validated();
        $serviceType = PrintServiceType::from($data['service_type']);
        $paperSize = PrintPaperSize::from($data['paper_size']);
        $unitPrice = PrintPriceSchedule::priceFor($serviceType, $paperSize);

        $printTransaction->update([
            ...$data,
            'unit_price' => $unitPrice,
            'total_amount' => $unitPrice * $data['pages'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Print job updated.')]);

        return to_route('print.index');
    }

    public function destroy(PrintTransaction $printTransaction): RedirectResponse
    {
        $this->authorize('delete', $printTransaction);

        $printTransaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Print job deleted.')]);

        return to_route('print.index');
    }
}
