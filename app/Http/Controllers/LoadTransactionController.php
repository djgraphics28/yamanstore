<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoadTransactionRequest;
use App\Http\Requests\UpdateLoadTransactionRequest;
use App\Models\LoadTransaction;
use App\Support\LoadFeeSchedule;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class LoadTransactionController extends Controller
{
    public function store(StoreLoadTransactionRequest $request): RedirectResponse
    {
        $this->authorize('create', LoadTransaction::class);

        $data = $request->validated();

        LoadTransaction::create([
            ...$data,
            'service_fee' => LoadFeeSchedule::feeFor($data['amount']),
            'user_id' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Load transaction recorded.')]);

        return to_route('gcash.index');
    }

    public function update(UpdateLoadTransactionRequest $request, LoadTransaction $loadTransaction): RedirectResponse
    {
        $this->authorize('update', $loadTransaction);

        $data = $request->validated();

        $loadTransaction->update([
            ...$data,
            'service_fee' => LoadFeeSchedule::feeFor($data['amount']),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Load transaction updated.')]);

        return to_route('gcash.index');
    }

    public function destroy(LoadTransaction $loadTransaction): RedirectResponse
    {
        $this->authorize('delete', $loadTransaction);

        $loadTransaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Load transaction deleted.')]);

        return to_route('gcash.index');
    }
}
