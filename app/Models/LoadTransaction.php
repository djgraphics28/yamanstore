<?php

namespace App\Models;

use App\Enums\LoadNetwork;
use Database\Factories\LoadTransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property LoadNetwork $network
 * @property int $amount
 * @property int $service_fee
 * @property string|null $reference_number
 * @property int $user_id
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class LoadTransaction extends Model
{
    /** @use HasFactory<LoadTransactionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'network',
        'amount',
        'service_fee',
        'reference_number',
        'user_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'network' => LoadNetwork::class,
            'amount' => 'integer',
            'service_fee' => 'integer',
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
