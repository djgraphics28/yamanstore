<?php

namespace App\Http\Requests;

use App\Concerns\UserValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    use UserValidationRules;

    public function rules(): array
    {
        return $this->updateUserRules($this->route('user')->id);
    }
}
