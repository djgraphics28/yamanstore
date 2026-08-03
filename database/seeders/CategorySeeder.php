<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groceries = Category::firstOrCreate(
            ['name' => 'Groceries'],
            ['slug' => Str::slug('Groceries'), 'is_active' => true, 'parent_id' => null],
        );

        // Promote existing rows to majors in place (preserving their id/slug), or create them if seeding fresh.
        foreach (['Drinks', 'School Supplies'] as $name) {
            Category::updateOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name), 'is_active' => true, 'parent_id' => null],
            );
        }

        $groceryChildren = [
            'Grocery', 'Canned Goods', 'Snacks', 'Biscuits', 'Coffee', 'Noodles',
            'Rice', 'Frozen Foods', 'Toiletries', 'Cigarettes', 'Ice Cream',
            'Bread', 'Eggs', 'LPG', 'Others',
        ];

        foreach ($groceryChildren as $name) {
            Category::updateOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name), 'is_active' => true, 'parent_id' => $groceries->id],
            );
        }

        // GCash and Mobile Load are now handled by the dedicated GCash module, not as product categories.
        Category::whereIn('name', ['GCash', 'Mobile Load'])
            ->get()
            ->each(function (Category $category): void {
                if ($category->products()->exists()) {
                    return;
                }

                $category->delete();
            });
    }
}
