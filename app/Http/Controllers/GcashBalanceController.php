<?php

namespace App\Http\Controllers;

use App\Models\GcashOpeningBalance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GcashBalanceController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('gcash.create'), 403);

        $data = $request->validate([
            'date' => ['required', 'date'],
            'cash_on_hand' => ['required', 'integer', 'min:0'],
            'gcash_balance' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        GcashOpeningBalance::updateOrCreate(
            ['date' => $data['date']],
            array_merge($data, ['user_id' => $request->user()->id]),
        );

        return back();
    }

    public function destroy(GcashOpeningBalance $gcashOpeningBalance, Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('gcash.delete'), 403);

        $gcashOpeningBalance->delete();

        return back();
    }
}
