<?php

use App\Models\LoadTransaction;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

test('recording a load transaction computes the fee from the bracket table', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('gcash.load.store'), [
        'network' => 'globe',
        'amount' => 100,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('gcash.index'));

    $this->assertDatabaseHas('load_transactions', [
        'network' => 'globe',
        'amount' => 100,
        'service_fee' => 15,
    ]);
});

test('load transaction fee computation matches boundary amounts', function (int $amount, int $expectedFee) {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('gcash.load.store'), [
        'network' => 'smart',
        'amount' => $amount,
    ]);

    $this->assertDatabaseHas('load_transactions', [
        'amount' => $amount,
        'service_fee' => $expectedFee,
    ]);
})->with([
    [10, 5],
    [50, 5],
    [51, 10],
    [99, 10],
    [100, 15],
    [500, 50],
]);

test('load transaction amount outside the allowed range is rejected', function (int $amount) {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('gcash.load.store'), [
        'network' => 'globe',
        'amount' => $amount,
    ]);

    $response->assertSessionHasErrors('amount');
})->with([[5], [501], [0]]);

test('a submitted service_fee is ignored and the server always recomputes it', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('gcash.load.store'), [
        'network' => 'globe',
        'amount' => 100,
        'service_fee' => 999,
    ]);

    $this->assertDatabaseHas('load_transactions', [
        'amount' => 100,
        'service_fee' => 15,
    ]);
    $this->assertDatabaseMissing('load_transactions', ['service_fee' => 999]);
});

test('inventory staff cannot access the gcash module', function () {
    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');

    $this->actingAs($inventoryStaff)->get(route('gcash.index'))->assertForbidden();
    $this->actingAs($inventoryStaff)
        ->post(route('gcash.load.store'), ['network' => 'globe', 'amount' => 100])
        ->assertForbidden();
});

test('cashier can create a load transaction but cannot delete one', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $loadTransaction = LoadTransaction::factory()->create();

    $this->actingAs($cashier)
        ->post(route('gcash.load.store'), ['network' => 'globe', 'amount' => 100])
        ->assertSessionHasNoErrors();

    $this->actingAs($cashier)
        ->delete(route('gcash.load.destroy', $loadTransaction))
        ->assertForbidden();
});

test('administrator can delete a load transaction', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $loadTransaction = LoadTransaction::factory()->create();

    $response = $this->actingAs($admin)->delete(route('gcash.load.destroy', $loadTransaction));

    $response->assertRedirect(route('gcash.index'));
    $this->assertSoftDeleted($loadTransaction);
});

test('editing a load transaction recomputes the fee from the new amount', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $loadTransaction = LoadTransaction::factory()->create(['network' => 'globe', 'amount' => 100, 'service_fee' => 15]);

    $response = $this->actingAs($cashier)->put(route('gcash.load.update', $loadTransaction), [
        'network' => 'smart',
        'amount' => 300,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('gcash.index'));

    $this->assertDatabaseHas('load_transactions', [
        'id' => $loadTransaction->id,
        'network' => 'smart',
        'amount' => 300,
        'service_fee' => 30,
    ]);
});

test('editing a load transaction with an out-of-range amount is rejected', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $loadTransaction = LoadTransaction::factory()->create();

    $response = $this->actingAs($cashier)->put(route('gcash.load.update', $loadTransaction), [
        'network' => 'globe',
        'amount' => 501,
    ]);

    $response->assertSessionHasErrors('amount');
});

test('inventory staff cannot edit a load transaction', function () {
    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');
    $loadTransaction = LoadTransaction::factory()->create();

    $this->actingAs($inventoryStaff)
        ->put(route('gcash.load.update', $loadTransaction), ['network' => 'globe', 'amount' => 100])
        ->assertForbidden();
});
