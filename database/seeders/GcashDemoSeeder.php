<?php

namespace Database\Seeders;

use App\Enums\GcashTransactionType;
use App\Enums\LoadNetwork;
use App\Models\GcashTransaction;
use App\Models\LoadTransaction;
use App\Models\User;
use App\Support\GcashFeeSchedule;
use App\Support\LoadFeeSchedule;
use Illuminate\Database\Seeder;

class GcashDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (LoadTransaction::count() > 0 || GcashTransaction::count() > 0) {
            return;
        }

        $user = User::first();

        if (! $user) {
            return;
        }

        $loads = [
            ['network' => LoadNetwork::Globe, 'amount' => 30],
            ['network' => LoadNetwork::Smart, 'amount' => 100],
            ['network' => LoadNetwork::Tnt, 'amount' => 50],
        ];

        foreach ($loads as $load) {
            LoadTransaction::create([
                'network' => $load['network'],
                'amount' => $load['amount'],
                'service_fee' => LoadFeeSchedule::feeFor($load['amount']),
                'user_id' => $user->id,
            ]);
        }

        $gcashTransactions = [
            ['type' => GcashTransactionType::CashIn, 'amount' => 500],
            ['type' => GcashTransactionType::CashOut, 'amount' => 1000],
            ['type' => GcashTransactionType::CashIn, 'amount' => 2000],
        ];

        foreach ($gcashTransactions as $transaction) {
            GcashTransaction::create([
                'type' => $transaction['type'],
                'amount' => $transaction['amount'],
                'service_fee' => GcashFeeSchedule::feeFor($transaction['amount']),
                'user_id' => $user->id,
            ]);
        }
    }
}
