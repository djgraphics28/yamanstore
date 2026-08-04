<?php

use App\Models\GcashTransaction;
use App\Models\User;
use Database\Seeders\GcashFeeBracketSeeder;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(GcashFeeBracketSeeder::class);
});

test('recording a cash in transaction computes the fee from the bracket table', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('gcash.transactions.store'), [
        'type' => 'cash_in',
        'amount' => 1000,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('gcash.index'));

    $this->assertDatabaseHas('gcash_transactions', [
        'type' => 'cash_in',
        'amount' => 1000,
        'service_fee' => 20,
    ]);
});

test('gcash fee computation matches boundary amounts', function (int $amount, int $expectedFee) {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('gcash.transactions.store'), [
        'type' => 'cash_out',
        'amount' => $amount,
    ]);

    $this->assertDatabaseHas('gcash_transactions', [
        'amount' => $amount,
        'service_fee' => $expectedFee,
    ]);
})->with([
    [1, 10],
    [100, 10],
    [101, 15],
    [500, 15],
    [501, 20],
    [3000, 60],
    [3001, 70],
    [4501, 100],
    [5000, 100],
]);

test('gcash amount outside the allowed range is rejected', function (int $amount) {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('gcash.transactions.store'), [
        'type' => 'cash_in',
        'amount' => $amount,
    ]);

    $response->assertSessionHasErrors('amount');
})->with([[0], [5001]]);

test('cashier can create a gcash transaction but cannot delete one', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $transaction = GcashTransaction::factory()->create();

    $this->actingAs($cashier)
        ->post(route('gcash.transactions.store'), ['type' => 'cash_out', 'amount' => 500])
        ->assertSessionHasNoErrors();

    $this->actingAs($cashier)
        ->delete(route('gcash.transactions.destroy', $transaction))
        ->assertForbidden();
});

test('administrator can delete a gcash transaction', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $transaction = GcashTransaction::factory()->create();

    $response = $this->actingAs($admin)->delete(route('gcash.transactions.destroy', $transaction));

    $response->assertRedirect(route('gcash.index'));
    $this->assertSoftDeleted($transaction);
});

test('editing a gcash transaction recomputes the fee from the new amount', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $transaction = GcashTransaction::factory()->create(['type' => 'cash_in', 'amount' => 100, 'service_fee' => 10]);

    $response = $this->actingAs($cashier)->put(route('gcash.transactions.update', $transaction), [
        'type' => 'cash_out',
        'amount' => 3000,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('gcash.index'));

    $this->assertDatabaseHas('gcash_transactions', [
        'id' => $transaction->id,
        'type' => 'cash_out',
        'amount' => 3000,
        'service_fee' => 60,
    ]);
});

test('editing a gcash transaction with an out-of-range amount is rejected', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $transaction = GcashTransaction::factory()->create();

    $response = $this->actingAs($cashier)->put(route('gcash.transactions.update', $transaction), [
        'type' => 'cash_in',
        'amount' => 5001,
    ]);

    $response->assertSessionHasErrors('amount');
});

test('inventory staff cannot edit a gcash transaction', function () {
    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');
    $transaction = GcashTransaction::factory()->create();

    $this->actingAs($inventoryStaff)
        ->put(route('gcash.transactions.update', $transaction), ['type' => 'cash_in', 'amount' => 100])
        ->assertForbidden();
});

test('fee_in_gcash is stored and defaults to false', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('gcash.transactions.store'), [
        'type' => 'cash_out',
        'amount' => 500,
    ]);

    $this->assertDatabaseHas('gcash_transactions', [
        'type' => 'cash_out',
        'amount' => 500,
        'fee_in_gcash' => false,
    ]);
});

test('cash out with fee_in_gcash adds fee to gcash balance not cash on hand', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    // ₱500 cash out, fee ₱15, fee paid via GCash → customer sends ₱515 GCash
    $this->actingAs($admin)->post(route('gcash.transactions.store'), [
        'type' => 'cash_out',
        'amount' => 500,
        'fee_in_gcash' => true,
    ]);

    $response = $this->actingAs($admin)->get(route('gcash.index'));

    $summary = $response->original->getData()['page']['props']['summary'];

    // GCash balance: +₱500 (cash out) + ₱15 (fee in GCash) = ₱515
    expect($summary['gcashBalance'])->toBe(515);
    // Cash on hand: -₱500 (gave cash) + ₱0 fee from cash (fee is in GCash) = -₱500
    expect($summary['cashOnHand'])->toBe(-500);
});

test('cash out without fee_in_gcash adds fee to cash on hand', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    // ₱500 cash out, fee ₱15, fee paid in cash
    $this->actingAs($admin)->post(route('gcash.transactions.store'), [
        'type' => 'cash_out',
        'amount' => 500,
        'fee_in_gcash' => false,
    ]);

    $response = $this->actingAs($admin)->get(route('gcash.index'));

    $summary = $response->original->getData()['page']['props']['summary'];

    // GCash balance: +₱500 (cash out amount only)
    expect($summary['gcashBalance'])->toBe(500);
    // Cash on hand: -₱500 + ₱15 fee = -₱485
    expect($summary['cashOnHand'])->toBe(-485);
});
