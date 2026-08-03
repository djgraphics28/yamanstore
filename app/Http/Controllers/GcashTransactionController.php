<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGcashTransactionRequest;
use App\Http\Requests\UpdateGcashTransactionRequest;
use App\Models\GcashTransaction;
use App\Support\GcashFeeSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class GcashTransactionController extends Controller
{
    public function store(StoreGcashTransactionRequest $request): RedirectResponse
    {
        $this->authorize('create', GcashTransaction::class);

        $data = $request->validated();

        GcashTransaction::create([
            ...$data,
            'service_fee' => GcashFeeSchedule::feeFor($data['amount']),
            'user_id' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('GCash transaction recorded.')]);

        return to_route('gcash.index');
    }

    public function update(UpdateGcashTransactionRequest $request, GcashTransaction $gcashTransaction): RedirectResponse
    {
        $this->authorize('update', $gcashTransaction);

        $data = $request->validated();

        $gcashTransaction->update([
            ...$data,
            'service_fee' => GcashFeeSchedule::feeFor($data['amount']),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('GCash transaction updated.')]);

        return to_route('gcash.index');
    }

    public function destroy(GcashTransaction $gcashTransaction): RedirectResponse
    {
        $this->authorize('delete', $gcashTransaction);

        $gcashTransaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('GCash transaction deleted.')]);

        return to_route('gcash.index');
    }
}
