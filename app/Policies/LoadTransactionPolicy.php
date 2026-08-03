<?php

namespace App\Policies;

use App\Models\LoadTransaction;
use App\Models\User;

class LoadTransactionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('gcash.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LoadTransaction $loadTransaction): bool
    {
        return $user->can('gcash.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('gcash.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LoadTransaction $loadTransaction): bool
    {
        return $user->can('gcash.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LoadTransaction $loadTransaction): bool
    {
        return $user->can('gcash.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, LoadTransaction $loadTransaction): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, LoadTransaction $loadTransaction): bool
    {
        return false;
    }
}
