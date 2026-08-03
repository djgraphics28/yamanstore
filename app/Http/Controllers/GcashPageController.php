<?php

namespace App\Http\Controllers;

use App\Enums\GcashTransactionType;
use App\Enums\LoadNetwork;
use App\Models\GcashTransaction;
use App\Models\LoadTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GcashPageController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('gcash.view'), 403);

        $todayLoad = $this->periodStats(LoadTransaction::query()->whereDate('created_at', today()));
        $todayCashIn = $this->periodStats(GcashTransaction::query()->whereDate('created_at', today())->where('type', GcashTransactionType::CashIn));
        $todayCashOut = $this->periodStats(GcashTransaction::query()->whereDate('created_at', today())->where('type', GcashTransactionType::CashOut));

        $totalFees = $todayLoad['fees'] + $todayCashIn['fees'] + $todayCashOut['fees'];

        return Inertia::render('gcash/index', [
            'summary' => [
                'load' => $todayLoad,
                'cashIn' => $todayCashIn,
                'cashOut' => $todayCashOut,
                'cashOnHand' => $todayCashIn['amount'] + $todayLoad['amount'] - $todayCashOut['amount'] + $totalFees,
                'gcashBalance' => $todayCashOut['amount'] - $todayCashIn['amount'] - $todayLoad['amount'],
            ],
            'recentTransactions' => $this->recentTransactions(),
            'networks' => collect(LoadNetwork::cases())->map(fn (LoadNetwork $network) => [
                'value' => $network->value,
                'label' => strtoupper($network->value),
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
    private function recentTransactions(): array
    {
        $loads = LoadTransaction::with('user:id,name')
            ->latest()
            ->limit(20)
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
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (GcashTransaction $transaction) => [
                'kind' => 'gcash',
                'id' => $transaction->id,
                'label' => $transaction->type === GcashTransactionType::CashIn ? 'Cash In' : 'Cash Out',
                'type' => $transaction->type->value,
                'amount' => $transaction->amount,
                'service_fee' => $transaction->service_fee,
                'reference_number' => $transaction->reference_number,
                'notes' => $transaction->notes,
                'user' => $transaction->user->name,
                'created_at' => $transaction->created_at,
            ]);

        return $loads->concat($gcash)
            ->sortByDesc(fn (array $row) => $row['created_at'])
            ->take(20)
            ->values()
            ->all();
    }
}
