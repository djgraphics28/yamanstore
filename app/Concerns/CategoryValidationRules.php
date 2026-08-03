<?php

namespace App\Concerns;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait CategoryValidationRules
{
    /**
     * Get the validation rules used to validate categories.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function categoryRules(?int $categoryId = null): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                $categoryId === null
                    ? Rule::unique(Category::class)
                    : Rule::unique(Category::class)->ignore($categoryId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->whereNull('parent_id'),
                ...($categoryId !== null ? [Rule::notIn([$categoryId])] : []),
                function (string $attribute, mixed $value, \Closure $fail) use ($categoryId): void {
                    if (! $value || ! $categoryId) {
                        return;
                    }

                    if (Category::where('parent_id', $categoryId)->exists()) {
                        $fail('A category with subcategories cannot be nested under another category.');
                    }
                },
            ],
        ];
    }
}
