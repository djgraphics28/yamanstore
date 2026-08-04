<?php

namespace Database\Factories;

use App\Enums\PrintPaperSize;
use App\Enums\PrintServiceType;
use App\Models\PrintTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PrintTransaction>
 */
class PrintTransactionFactory extends Factory
{
    public function definition(): array
    {
        $serviceType = $this->faker->randomElement(PrintServiceType::cases());
        $paperSize = $serviceType === PrintServiceType::Photo
            ? $this->faker->randomElement([PrintPaperSize::PhotoFull, PrintPaperSize::PhotoHalf])
            : $this->faker->randomElement([PrintPaperSize::Short, PrintPaperSize::A4, PrintPaperSize::Long]);

        $prices = [
            'mono' => ['short' => 2, 'a4' => 3, 'long' => 3],
            'color' => ['short' => 3, 'a4' => 5, 'long' => 5],
            'photo' => ['photo_full' => 15, 'photo_half' => 10],
            'scan' => ['short' => 2, 'a4' => 3, 'long' => 3],
            'photocopy' => ['short' => 2, 'a4' => 3, 'long' => 3],
        ];

        $unitPrice = $prices[$serviceType->value][$paperSize->value];
        $pages = $this->faker->numberBetween(1, 20);

        return [
            'service_type' => $serviceType,
            'paper_size' => $paperSize,
            'pages' => $pages,
            'unit_price' => $unitPrice,
            'total_amount' => $pages * $unitPrice,
            'notes' => null,
            'user_id' => User::factory(),
        ];
    }
}
