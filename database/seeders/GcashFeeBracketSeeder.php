<?php

namespace Database\Seeders;

use App\Models\GcashFeeBracket;
use Illuminate\Database\Seeder;

class GcashFeeBracketSeeder extends Seeder
{
    public function run(): void
    {
        if (GcashFeeBracket::count() > 0) {
            return;
        }

        $gcashBrackets = [
            [1, 100, 10],
            [101, 500, 15],
            [501, 1000, 20],
            [1001, 1500, 30],
            [1501, 2000, 40],
            [2001, 2500, 50],
            [2501, 3000, 60],
            [3001, 3500, 70],
            [3501, 4000, 80],
            [4001, 4500, 90],
            [4501, 5000, 100],
        ];

        $loadBrackets = [
            [10, 50, 5],
            [51, 99, 10],
            [100, 150, 15],
            [151, 200, 20],
            [201, 300, 30],
            [301, 500, 50],
        ];

        foreach ($gcashBrackets as [$min, $max, $fee]) {
            GcashFeeBracket::create([
                'schedule_type' => 'gcash',
                'min_amount' => $min,
                'max_amount' => $max,
                'fee' => $fee,
            ]);
        }

        foreach ($loadBrackets as [$min, $max, $fee]) {
            GcashFeeBracket::create([
                'schedule_type' => 'load',
                'min_amount' => $min,
                'max_amount' => $max,
                'fee' => $fee,
            ]);
        }
    }
}
