<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;

trait SupplierValidationRules
{
    /**
     * Get the validation rules used to validate suppliers.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function supplierRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'contact_person' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email:rfc', 'max:150'],
            'address' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
