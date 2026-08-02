<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ],
            'brand' => $this->brand,
            'supplier' => $this->whenLoaded('supplier', fn () => $this->supplier ? [
                'id' => $this->supplier->id,
                'name' => $this->supplier->name,
            ] : null),
            'cost_price' => $this->cost_price,
            'selling_price' => $this->selling_price,
            'unit' => $this->unit,
            'current_stock' => $this->current_stock,
            'minimum_stock' => $this->minimum_stock,
            'expiration_date' => $this->expiration_date?->toDateString(),
            'image_url' => $this->image_url,
            'status' => $this->status,
        ];
    }
}
