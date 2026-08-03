<?php

namespace App\Http\Requests;

use App\Concerns\LoadTransactionValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLoadTransactionRequest extends FormRequest
{
    use LoadTransactionValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->loadTransactionRules();
    }
}
