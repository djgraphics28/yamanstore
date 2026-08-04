<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

trait UserValidationRules
{
    protected function storeUserRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in(Role::pluck('name')->all())],
        ];
    }

    protected function updateUserRules(int $userId): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique(User::class)->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', 'string', Rule::in(Role::pluck('name')->all())],
        ];
    }
}
