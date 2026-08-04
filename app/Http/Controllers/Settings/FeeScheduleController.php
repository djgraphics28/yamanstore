<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\GcashFeeBracket;
use App\Support\GcashFeeSchedule;
use App\Support\LoadFeeSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FeeScheduleController extends Controller
{
    public function edit(): Response
    {
        abort_unless(request()->user()?->can('settings.manage'), 403);

        return Inertia::render('settings/fee-schedule', [
            'gcashBrackets' => GcashFeeBracket::where('schedule_type', 'gcash')
                ->orderBy('min_amount')
                ->get(['id', 'min_amount', 'max_amount', 'fee']),
            'loadBrackets' => GcashFeeBracket::where('schedule_type', 'load')
                ->orderBy('min_amount')
                ->get(['id', 'min_amount', 'max_amount', 'fee']),
        ]);
    }

    public function updateGcash(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('settings.manage'), 403);

        $validated = $request->validate([
            'brackets' => ['required', 'array', 'min:1'],
            'brackets.*.min_amount' => ['required', 'integer', 'min:1'],
            'brackets.*.max_amount' => ['required', 'integer', 'min:1'],
            'brackets.*.fee' => ['required', 'integer', 'min:0'],
        ]);

        $this->validateNoOverlaps($validated['brackets'], 'GCash');

        DB::transaction(function () use ($validated): void {
            GcashFeeBracket::where('schedule_type', 'gcash')->delete();
            foreach ($validated['brackets'] as $bracket) {
                GcashFeeBracket::create([
                    'schedule_type' => 'gcash',
                    'min_amount' => $bracket['min_amount'],
                    'max_amount' => $bracket['max_amount'],
                    'fee' => $bracket['fee'],
                ]);
            }
        });

        Cache::forget('gcash_fee_brackets_gcash');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('GCash fee schedule updated.')]);

        return to_route('fee-schedule.edit');
    }

    public function updateLoad(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('settings.manage'), 403);

        $validated = $request->validate([
            'brackets' => ['required', 'array', 'min:1'],
            'brackets.*.min_amount' => ['required', 'integer', 'min:1'],
            'brackets.*.max_amount' => ['required', 'integer', 'min:1'],
            'brackets.*.fee' => ['required', 'integer', 'min:0'],
        ]);

        $this->validateNoOverlaps($validated['brackets'], 'Load');

        DB::transaction(function () use ($validated): void {
            GcashFeeBracket::where('schedule_type', 'load')->delete();
            foreach ($validated['brackets'] as $bracket) {
                GcashFeeBracket::create([
                    'schedule_type' => 'load',
                    'min_amount' => $bracket['min_amount'],
                    'max_amount' => $bracket['max_amount'],
                    'fee' => $bracket['fee'],
                ]);
            }
        });

        Cache::forget('gcash_fee_brackets_load');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Load fee schedule updated.')]);

        return to_route('fee-schedule.edit');
    }

    private function validateNoOverlaps(array $brackets, string $label): void
    {
        $sorted = collect($brackets)->sortBy('min_amount')->values();

        foreach ($sorted as $bracket) {
            if ($bracket['max_amount'] < $bracket['min_amount']) {
                abort(422, "Each {$label} bracket's max amount must be greater than or equal to its min amount.");
            }
        }

        for ($i = 1; $i < $sorted->count(); $i++) {
            if ($sorted[$i]['min_amount'] <= $sorted[$i - 1]['max_amount']) {
                abort(422, "{$label} fee brackets must not overlap.");
            }
        }
    }
}
