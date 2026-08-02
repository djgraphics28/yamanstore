<?php

namespace App\Models;

use Database\Factories\ProductSupplierPriceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property int $supplier_id
 * @property string $cost_price
 * @property bool $is_preferred
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 * @property-read Supplier $supplier
 */
class ProductSupplierPrice extends Model
{
    /** @use HasFactory<ProductSupplierPriceFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'supplier_id',
        'cost_price',
        'is_preferred',
    ];

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'is_preferred' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<Supplier, $this>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
