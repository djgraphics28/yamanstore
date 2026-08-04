<?php

namespace App\Support;

use App\Models\GcashFeeBracket;
use Illuminate\Support\Facades\Cache;

final class GcashFeeSchedule
{
    public static function brackets(): array
    {
        return Cache::remember('gcash_fee_brackets_gcash', 60, function () {
            return GcashFeeBracket::where('schedule_type', 'gcash')
                ->orderBy('min_amount')
                ->get(['min_amount', 'max_amount', 'fee'])
                ->map(fn ($b) => [$b->min_amount, $b->max_amount, $b->fee])
                ->all();
        });
    }

    public static function minAmount(): int
    {
        $brackets = self::brackets();

        return ! empty($brackets) ? $brackets[0][0] : 1;
    }

    public static function maxAmount(): int
    {
        $brackets = self::brackets();

        return ! empty($brackets) ? end($brackets)[1] : 5000;
    }

    public static function feeFor(int $amount): ?int
    {
        foreach (self::brackets() as [$min, $max, $fee]) {
            if ($amount >= $min && $amount <= $max) {
                return $fee;
            }
        }

        return null;
    }
}
