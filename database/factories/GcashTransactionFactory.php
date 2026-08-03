<?php

namespace Database\Factories;

use App\Enums\GcashTransactionType;
use App\Models\GcashTransaction;
use App\Models\User;
use App\Support\GcashFeeSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GcashTransaction>
 */
class GcashTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->numberBetween(GcashFeeSchedule::MIN_AMOUNT, GcashFeeSchedule::MAX_AMOUNT);

        return [
            'type' => fake()->randomElement(GcashTransactionType::cases()),
            'amount' => $amount,
            'service_fee' => GcashFeeSchedule::feeFor($amount),
            'reference_number' => fake()->optional()->numerify('REF########'),
            'user_id' => User::factory(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
