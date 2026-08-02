<?php

namespace App\Concerns;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProductValidationRules
{
    /**
     * Get the validation rules used to validate products.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function productRules(?int $productId = null): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'sku' => [
                'required',
                'string',
                'max:64',
                $productId === null
                    ? Rule::unique(Product::class)
                    : Rule::unique(Product::class)->ignore($productId),
            ],
            'barcode' => [
                'nullable',
                'string',
                'max:64',
                $productId === null
                    ? Rule::unique(Product::class)
                    : Rule::unique(Product::class)->ignore($productId),
            ],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand' => ['nullable', 'string', 'max:100'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'supplier_prices' => ['nullable', 'array'],
            'supplier_prices.*.supplier_id' => ['required', 'integer', 'exists:suppliers,id', 'distinct'],
            'supplier_prices.*.cost_price' => ['required', 'numeric', 'min:0'],
            'supplier_prices.*.is_preferred' => ['boolean'],
            'unit' => ['required', 'string', 'max:20'],
            'current_stock' => ['required', 'integer', 'min:0'],
            'minimum_stock' => ['required', 'integer', 'min:0'],
            'expiration_date' => ['nullable', 'date'],
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
