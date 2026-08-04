<?php

namespace Database\Factories;

use App\Enums\LoadNetwork;
use App\Models\LoadTransaction;
use App\Models\User;
use App\Support\LoadFeeSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoadTransaction>
 */
class LoadTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->numberBetween(LoadFeeSchedule::minAmount(), LoadFeeSchedule::maxAmount());

        return [
            'network' => fake()->randomElement(LoadNetwork::cases()),
            'amount' => $amount,
            'service_fee' => LoadFeeSchedule::feeFor($amount),
            'reference_number' => fake()->optional()->numerify('REF########'),
            'user_id' => User::factory(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
