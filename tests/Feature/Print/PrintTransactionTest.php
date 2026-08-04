<?php

use App\Models\PrintTransaction;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

test('recording a mono short print computes the correct unit price and total', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('print.store'), [
        'service_type' => 'mono',
        'paper_size' => 'short',
        'pages' => 5,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('print.index'));

    $this->assertDatabaseHas('print_transactions', [
        'service_type' => 'mono',
        'paper_size' => 'short',
        'pages' => 5,
        'unit_price' => 2,
        'total_amount' => 10,
    ]);
});

test('price schedule covers every service and paper size combination', function (string $serviceType, string $paperSize, int $expectedPrice) {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('print.store'), [
        'service_type' => $serviceType,
        'paper_size' => $paperSize,
        'pages' => 1,
    ]);

    $this->assertDatabaseHas('print_transactions', [
        'service_type' => $serviceType,
        'paper_size' => $paperSize,
        'unit_price' => $expectedPrice,
        'total_amount' => $expectedPrice,
    ]);
})->with([
    ['mono', 'short', 2],
    ['mono', 'a4', 3],
    ['mono', 'long', 3],
    ['color', 'short', 3],
    ['color', 'a4', 5],
    ['color', 'long', 5],
    ['photo', 'photo_full', 15],
    ['photo', 'photo_half', 10],
    ['scan', 'short', 2],
    ['scan', 'a4', 3],
    ['scan', 'long', 3],
    ['photocopy', 'short', 2],
    ['photocopy', 'a4', 3],
    ['photocopy', 'long', 3],
]);

test('total_amount is always pages times unit_price', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('print.store'), [
        'service_type' => 'color',
        'paper_size' => 'a4',
        'pages' => 7,
    ]);

    $this->assertDatabaseHas('print_transactions', [
        'unit_price' => 5,
        'pages' => 7,
        'total_amount' => 35,
    ]);
});

test('client-supplied unit_price is ignored and server computes it', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('print.store'), [
        'service_type' => 'mono',
        'paper_size' => 'short',
        'pages' => 3,
        'unit_price' => 999,
        'total_amount' => 2997,
    ]);

    $this->assertDatabaseHas('print_transactions', [
        'unit_price' => 2,
        'total_amount' => 6,
    ]);
});

test('paper size invalid for the selected service type is rejected', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('print.store'), [
        'service_type' => 'mono',
        'paper_size' => 'photo_full',
        'pages' => 1,
    ]);

    $response->assertSessionHasErrors('paper_size');
    $this->assertDatabaseCount('print_transactions', 0);
});

test('photo service type rejects non-photo paper sizes', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('print.store'), [
        'service_type' => 'photo',
        'paper_size' => 'short',
        'pages' => 1,
    ]);

    $response->assertSessionHasErrors('paper_size');
});

test('pages must be at least 1', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $response = $this->actingAs($cashier)->post(route('print.store'), [
        'service_type' => 'mono',
        'paper_size' => 'short',
        'pages' => 0,
    ]);

    $response->assertSessionHasErrors('pages');
});

test('cashier can create a print job but cannot delete one', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $transaction = PrintTransaction::factory()->create();

    $this->actingAs($cashier)
        ->post(route('print.store'), [
            'service_type' => 'mono',
            'paper_size' => 'short',
            'pages' => 1,
        ])
        ->assertSessionHasNoErrors();

    $this->actingAs($cashier)
        ->delete(route('print.destroy', $transaction))
        ->assertForbidden();
});

test('administrator can delete a print transaction', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $transaction = PrintTransaction::factory()->create();

    $this->actingAs($admin)
        ->delete(route('print.destroy', $transaction))
        ->assertRedirect(route('print.index'));

    $this->assertSoftDeleted('print_transactions', ['id' => $transaction->id]);
});

test('inventory staff cannot access the print module', function () {
    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');

    $this->actingAs($inventoryStaff)
        ->get(route('print.index'))
        ->assertForbidden();

    $this->actingAs($inventoryStaff)
        ->post(route('print.store'), [
            'service_type' => 'mono',
            'paper_size' => 'short',
            'pages' => 1,
        ])
        ->assertForbidden();
});

test('cashier can update a print transaction', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $transaction = PrintTransaction::factory()->create([
        'service_type' => 'mono',
        'paper_size' => 'short',
        'pages' => 2,
        'unit_price' => 2,
        'total_amount' => 4,
    ]);

    $this->actingAs($cashier)
        ->put(route('print.update', $transaction), [
            'service_type' => 'color',
            'paper_size' => 'a4',
            'pages' => 3,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('print.index'));

    $this->assertDatabaseHas('print_transactions', [
        'id' => $transaction->id,
        'service_type' => 'color',
        'paper_size' => 'a4',
        'pages' => 3,
        'unit_price' => 5,
        'total_amount' => 15,
    ]);
});

test('unauthenticated user cannot access the print module', function () {
    $this->get(route('print.index'))->assertRedirect(route('login'));
    $this->post(route('print.store'), [])->assertRedirect(route('login'));
});
