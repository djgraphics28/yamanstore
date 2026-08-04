<?php

namespace App\Support;

use App\Enums\PrintPaperSize;
use App\Enums\PrintServiceType;

final class PrintPriceSchedule
{
    /** @var array<string, array<string, int>> */
    private const PRICES = [
        'mono' => ['short' => 2, 'a4' => 3, 'long' => 3],
        'color' => ['short' => 3, 'a4' => 5, 'long' => 5],
        'photo' => ['photo_full' => 15, 'photo_half' => 10],
        'scan' => ['short' => 2, 'a4' => 3, 'long' => 3],
        'photocopy' => ['short' => 2, 'a4' => 3, 'long' => 3],
    ];

    public static function priceFor(PrintServiceType $serviceType, PrintPaperSize $paperSize): ?int
    {
        return self::PRICES[$serviceType->value][$paperSize->value] ?? null;
    }

    /**
     * @return array<string, array<string, int>>
     */
    public static function all(): array
    {
        return self::PRICES;
    }

    /**
     * Valid paper sizes for a given service type.
     *
     * @return list<string>
     */
    public static function sizesFor(PrintServiceType $serviceType): array
    {
        return array_keys(self::PRICES[$serviceType->value] ?? []);
    }
}
