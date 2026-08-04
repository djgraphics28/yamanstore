<?php

namespace App\Policies;

use App\Models\PrintTransaction;
use App\Models\User;

class PrintTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('print.view');
    }

    public function create(User $user): bool
    {
        return $user->can('print.create');
    }

    public function update(User $user, PrintTransaction $printTransaction): bool
    {
        return $user->can('print.update');
    }

    public function delete(User $user, PrintTransaction $printTransaction): bool
    {
        return $user->can('print.delete');
    }
}
