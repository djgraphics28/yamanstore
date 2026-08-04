<?php

namespace App\Models;

use App\Enums\PrintPaperSize;
use App\Enums\PrintServiceType;
use Database\Factories\PrintTransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property PrintServiceType $service_type
 * @property PrintPaperSize $paper_size
 * @property int $pages
 * @property int $unit_price
 * @property int $total_amount
 * @property string|null $notes
 * @property int $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class PrintTransaction extends Model
{
    /** @use HasFactory<PrintTransactionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'service_type',
        'paper_size',
        'pages',
        'unit_price',
        'total_amount',
        'notes',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'service_type' => PrintServiceType::class,
            'paper_size' => PrintPaperSize::class,
            'pages' => 'integer',
            'unit_price' => 'integer',
            'total_amount' => 'integer',
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
