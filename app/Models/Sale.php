<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    protected $fillable = [
        'reference_number', 'user_id', 'subtotal', 'discount', 'total',
        'amount_tendered', 'change_due', 'payment_method', 'status',
        'voided_at', 'voided_by', 'void_reason', 'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_tendered' => 'decimal:2',
        'change_due' => 'decimal:2',
        'voided_at' => 'datetime',
    ];

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function voidedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public static function generateReference(): string
    {
        $today = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->count();

        return sprintf('SALE-%s-%04d', $today, $count + 1);
    }
}
