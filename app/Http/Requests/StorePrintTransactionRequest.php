<?php

namespace App\Http\Requests;

use App\Concerns\PrintTransactionValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePrintTransactionRequest extends FormRequest
{
    use PrintTransactionValidationRules;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->printTransactionRules();
    }
}
