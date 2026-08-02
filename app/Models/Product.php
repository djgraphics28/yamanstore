<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $name
 * @property string $sku
 * @property string|null $barcode
 * @property int $category_id
 * @property string|null $brand
 * @property int|null $supplier_id
 * @property string $cost_price
 * @property string $selling_price
 * @property string $unit
 * @property int $current_stock
 * @property int $minimum_stock
 * @property Carbon|null $expiration_date
 * @property string|null $image_path
 * @property ProductStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read string|null $image_url
 */
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, SoftDeletes;

    protected $appends = [
        'image_url',
    ];

    protected $fillable = [
        'name',
        'sku',
        'barcode',
        'category_id',
        'brand',
        'supplier_id',
        'cost_price',
        'selling_price',
        'unit',
        'current_stock',
        'minimum_stock',
        'expiration_date',
        'image_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'expiration_date' => 'date',
            'status' => ProductStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Supplier, $this>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * @return HasMany<ProductSupplierPrice, $this>
     */
    public function supplierPrices(): HasMany
    {
        return $this->hasMany(ProductSupplierPrice::class);
    }

    /**
     * Replace this product's supplier price list, keep exactly one row marked
     * preferred, and sync the product's own cost_price/supplier_id to match it.
     *
     * @param  array<int, array{supplier_id: int, cost_price: float|string, is_preferred?: bool}>  $rows
     */
    public function syncSupplierPrices(array $rows): void
    {
        $supplierIds = array_column($rows, 'supplier_id');

        $this->supplierPrices()->whereNotIn('supplier_id', $supplierIds)->delete();

        $preferredIndex = collect($rows)->search(fn (array $row) => (bool) ($row['is_preferred'] ?? false));

        if ($preferredIndex === false) {
            $preferredIndex = 0;
        }

        $preferredRow = null;

        foreach ($rows as $index => $row) {
            $isPreferred = $index === $preferredIndex;

            $price = $this->supplierPrices()->updateOrCreate(
                ['supplier_id' => $row['supplier_id']],
                ['cost_price' => $row['cost_price'], 'is_preferred' => $isPreferred],
            );

            if ($isPreferred) {
                $preferredRow = $price;
            }
        }

        $this->update([
            'supplier_id' => $preferredRow?->supplier_id,
            'cost_price' => $preferredRow?->cost_price ?? 0,
        ]);
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
        );
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', ProductStatus::Active);
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('current_stock', '<=', 'minimum_stock')->where('current_stock', '>', 0);
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query->where('current_stock', '<=', 0);
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function (Builder $query) use ($term): void {
            $query->where('name', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%")
                ->orWhere('barcode', 'like', "%{$term}%");
        });
    }
}
