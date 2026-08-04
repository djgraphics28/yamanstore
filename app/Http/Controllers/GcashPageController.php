<?php

namespace App\Http\Controllers;

use App\Enums\GcashTransactionType;
use App\Enums\LoadNetwork;
use App\Models\GcashOpeningBalance;
use App\Models\GcashTransaction;
use App\Models\LoadTransaction;
use App\Support\GcashFeeSchedule;
use App\Support\LoadFeeSchedule;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GcashPageController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('gcash.view'), 403);

        $dateFrom = Carbon::parse($request->input('date_from', today()->toDateString()))->startOfDay();
        $dateTo = Carbon::parse($request->input('date_to', today()->toDateString()))->endOfDay();

        if ($dateTo->lt($dateFrom)) {
            $dateTo = $dateFrom->copy()->endOfDay();
        }

        $periodLoad = $this->periodStats(
            LoadTransaction::query()->whereBetween('created_at', [$dateFrom, $dateTo])
        );
        $periodCashIn = $this->periodStats(
            GcashTransaction::query()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('type', GcashTransactionType::CashIn)
        );
        $periodCashOut = $this->periodStats(
            GcashTransaction::query()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('type', GcashTransactionType::CashOut)
        );

        $gcashFees = (int) GcashTransaction::query()
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('type', GcashTransactionType::CashOut)
            ->where('fee_in_gcash', true)
            ->sum('service_fee');

        $totalFees = $periodLoad['fees'] + $periodCashIn['fees'] + $periodCashOut['fees'];

        $openingBalance = GcashOpeningBalance::whereDate('date', $dateFrom->toDateString())->first();

        $openingCash = $openingBalance?->cash_on_hand ?? 0;
        $openingGcash = $openingBalance?->gcash_balance ?? 0;

        return Inertia::render('gcash/index', [
            'summary' => [
                'load' => $periodLoad,
                'cashIn' => $periodCashIn,
                'cashOut' => $periodCashOut,
                'cashOnHand' => $openingCash + $periodCashIn['amount'] + $periodLoad['amount'] - $periodCashOut['amount'] + ($totalFees - $gcashFees),
                'gcashBalance' => $openingGcash + $periodCashOut['amount'] + $gcashFees - $periodCashIn['amount'] - $periodLoad['amount'],
                'openingCashOnHand' => $openingCash,
                'openingGcashBalance' => $openingGcash,
            ],
            'openingBalance' => $openingBalance ? [
                'id' => $openingBalance->id,
                'date' => $openingBalance->date->toDateString(),
                'cash_on_hand' => $openingBalance->cash_on_hand,
                'gcash_balance' => $openingBalance->gcash_balance,
                'notes' => $openingBalance->notes,
            ] : null,
            'dateFrom' => $dateFrom->toDateString(),
            'dateTo' => $dateTo->toDateString(),
            'recentTransactions' => $this->recentTransactions($dateFrom, $dateTo),
            'networks' => collect(LoadNetwork::cases())->map(fn (LoadNetwork $network) => [
                'value' => $network->value,
                'label' => strtoupper($network->value),
            ]),
            'gcashBrackets' => collect(GcashFeeSchedule::brackets())->map(fn ($b) => [
                'min_amount' => $b[0],
                'max_amount' => $b[1],
                'fee' => $b[2],
            ]),
            'loadBrackets' => collect(LoadFeeSchedule::brackets())->map(fn ($b) => [
                'min_amount' => $b[0],
                'max_amount' => $b[1],
                'fee' => $b[2],
            ]),
        ]);
    }

    /**
     * @return array{count: int, amount: int, fees: int}
     */
    private function periodStats(Builder $query): array
    {
        $row = $query->selectRaw('COUNT(*) as count, COALESCE(SUM(amount),0) as amount, COALESCE(SUM(service_fee),0) as fees')->first();

        return [
            'count' => (int) $row->count,
            'amount' => (int) $row->amount,
            'fees' => (int) $row->fees,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentTransactions(Carbon $dateFrom, Carbon $dateTo): array
    {
        $loads = LoadTransaction::with('user:id,name')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (LoadTransaction $transaction) => [
                'kind' => 'load',
                'id' => $transaction->id,
                'label' => strtoupper($transaction->network->value),
                'network' => $transaction->network->value,
                'amount' => $transaction->amount,
                'service_fee' => $transaction->service_fee,
                'reference_number' => $transaction->reference_number,
                'notes' => $transaction->notes,
                'user' => $transaction->user->name,
                'created_at' => $transaction->created_at,
            ]);

        $gcash = GcashTransaction::with('user:id,name')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (GcashTransaction $transaction) => [
                'kind' => 'gcash',
                'id' => $transaction->id,
                'label' => $transaction->type === GcashTransactionType::CashIn ? 'Cash In' : 'Cash Out',
                'type' => $transaction->type->value,
                'amount' => $transaction->amount,
                'service_fee' => $transaction->service_fee,
                'fee_in_gcash' => $transaction->fee_in_gcash,
                'reference_number' => $transaction->reference_number,
                'notes' => $transaction->notes,
                'user' => $transaction->user->name,
                'created_at' => $transaction->created_at,
            ]);

        return $loads->concat($gcash)
            ->sortByDesc(fn (array $row) => $row['created_at'])
            ->take(50)
            ->values()
            ->all();
    }
}
