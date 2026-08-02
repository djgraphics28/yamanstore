<?php

use App\Models\Product;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard stats reflect low stock and out of stock product counts', function () {
    $user = User::factory()->create();

    Product::factory()->create(['current_stock' => 5, 'minimum_stock' => 10]);
    Product::factory()->create(['current_stock' => 0, 'minimum_stock' => 10]);
    Product::factory()->create(['current_stock' => 0, 'minimum_stock' => 10]);
    Product::factory()->create(['current_stock' => 50, 'minimum_stock' => 10]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.lowStockCount', 1)
        ->where('stats.outOfStockCount', 2)
        ->where('stats.totalProducts', 4)
    );
});
