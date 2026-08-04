<?php

namespace App\Http\Requests;

use App\Concerns\UserValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    use UserValidationRules;

    public function rules(): array
    {
        return $this->storeUserRules();
    }
}
