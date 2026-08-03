<?php

namespace App\Concerns;

use App\Enums\LoadNetwork;
use App\Support\LoadFeeSchedule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait LoadTransactionValidationRules
{
    /**
     * Get the validation rules used to validate load transactions.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function loadTransactionRules(): array
    {
        return [
            'network' => ['required', Rule::enum(LoadNetwork::class)],
            'amount' => ['required', 'integer', 'min:'.LoadFeeSchedule::MIN_AMOUNT, 'max:'.LoadFeeSchedule::MAX_AMOUNT],
            'reference_number' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
