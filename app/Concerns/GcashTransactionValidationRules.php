<?php

namespace App\Concerns;

use App\Enums\GcashTransactionType;
use App\Support\GcashFeeSchedule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait GcashTransactionValidationRules
{
    /**
     * Get the validation rules used to validate GCash transactions.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function gcashTransactionRules(): array
    {
        return [
            'type' => ['required', Rule::enum(GcashTransactionType::class)],
            'amount' => ['required', 'integer', 'min:'.GcashFeeSchedule::minAmount(), 'max:'.GcashFeeSchedule::maxAmount()],
            'fee_in_gcash' => ['nullable', 'boolean'],
            'reference_number' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
