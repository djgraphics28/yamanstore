<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['schedule_type', 'min_amount', 'max_amount', 'fee'])]
class GcashFeeBracket extends Model
{
    protected function casts(): array
    {
        return [
            'min_amount' => 'integer',
            'max_amount' => 'integer',
            'fee' => 'integer',
        ];
    }
}
