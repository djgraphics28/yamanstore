<?php

namespace App\Concerns;

use App\Enums\PrintPaperSize;
use App\Enums\PrintServiceType;
use App\Support\PrintPriceSchedule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait PrintTransactionValidationRules
{
    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function printTransactionRules(): array
    {
        return [
            'service_type' => ['required', Rule::enum(PrintServiceType::class)],
            'paper_size' => [
                'required',
                Rule::enum(PrintPaperSize::class),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $serviceType = request()->enum('service_type', PrintServiceType::class);
                    if (! $serviceType) {
                        return;
                    }
                    if (PrintPriceSchedule::priceFor($serviceType, PrintPaperSize::from($value)) === null) {
                        $fail("The paper size \"{$value}\" is not available for the selected service type.");
                    }
                },
            ],
            'pages' => ['required', 'integer', 'min:1', 'max:9999'],
            'notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
