<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $authUser): bool
    {
        return $authUser->can('users.view');
    }

    public function view(User $authUser, User $user): bool
    {
        return $authUser->can('users.view');
    }

    public function create(User $authUser): bool
    {
        return $authUser->can('users.create');
    }

    public function update(User $authUser, User $user): bool
    {
        return $authUser->can('users.update');
    }

    public function delete(User $authUser, User $user): bool
    {
        return $authUser->can('users.delete') && $authUser->id !== $user->id;
    }
}
