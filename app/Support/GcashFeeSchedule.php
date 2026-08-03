<?php

namespace App\Support;

final class GcashFeeSchedule
{
    public const MIN_AMOUNT = 1;

    public const MAX_AMOUNT = 5000;

    /**
     * @var array<int, array{0: int, 1: int, 2: int}>
     */
    private const BRACKETS = [
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

    public static function feeFor(int $amount): ?int
    {
        foreach (self::BRACKETS as [$min, $max, $fee]) {
            if ($amount >= $min && $amount <= $max) {
                return $fee;
            }
        }

        return null;
    }
}
