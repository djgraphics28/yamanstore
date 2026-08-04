<?php

namespace App\Models;

use App\Enums\GcashTransactionType;
use Database\Factories\GcashTransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property GcashTransactionType $type
 * @property int $amount
 * @property int $service_fee
 * @property bool $fee_in_gcash
 * @property string|null $reference_number
 * @property int $user_id
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class GcashTransaction extends Model
{
    /** @use HasFactory<GcashTransactionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type',
        'amount',
        'service_fee',
        'fee_in_gcash',
        'reference_number',
        'user_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'type' => GcashTransactionType::class,
            'amount' => 'integer',
            'service_fee' => 'integer',
            'fee_in_gcash' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
