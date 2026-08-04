<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GcashOpeningBalance extends Model
{
    protected $fillable = ['date', 'cash_on_hand', 'gcash_balance', 'notes', 'user_id'];

    protected $casts = [
        'date' => 'date',
        'cash_on_hand' => 'integer',
        'gcash_balance' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
