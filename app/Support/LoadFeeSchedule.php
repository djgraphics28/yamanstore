<?php

namespace App\Support;

final class LoadFeeSchedule
{
    public const MIN_AMOUNT = 10;

    public const MAX_AMOUNT = 500;

    /**
     * @var array<int, array{0: int, 1: int, 2: int}>
     */
    private const BRACKETS = [
        [10, 50, 5],
        [51, 99, 10],
        [100, 150, 15],
        [151, 200, 20],
        [201, 300, 30],
        [301, 500, 50],
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
