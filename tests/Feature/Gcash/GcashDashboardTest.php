<?php

use App\Models\GcashTransaction;
use App\Models\LoadTransaction;
use App\Models\User;
use Database\Seeders\GcashFeeBracketSeeder;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(GcashFeeBracketSeeder::class);
});

test('guests are redirected and unauthorized roles are forbidden', function () {
    $this->get(route('gcash.index'))->assertRedirect(route('login'));

    $inventoryStaff = User::factory()->create()->assignRole('Inventory Staff');
    $this->actingAs($inventoryStaff)->get(route('gcash.index'))->assertForbidden();
});

test('dashboard summary totals and the cash on hand / gcash balance formulas are correct', function () {
    $user = User::factory()->create()->assignRole('Administrator');

    LoadTransaction::factory()->create(['network' => 'globe', 'amount' => 100, 'service_fee' => 15, 'user_id' => $user->id]);
    GcashTransaction::factory()->create(['type' => 'cash_in', 'amount' => 500, 'service_fee' => 15, 'user_id' => $user->id]);
    GcashTransaction::factory()->create(['type' => 'cash_out', 'amount' => 1000, 'service_fee' => 20, 'user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('gcash.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('summary.load.amount', 100)
        ->where('summary.load.fees', 15)
        ->where('summary.load.count', 1)
        ->where('summary.cashIn.amount', 500)
        ->where('summary.cashIn.fees', 15)
        ->where('summary.cashOut.amount', 1000)
        ->where('summary.cashOut.fees', 20)
        ->where('summary.cashOnHand', -350)
        ->where('summary.gcashBalance', 400)
    );
});

test('recent transactions are merged across both tables, sorted by newest, and truncated to 20', function () {
    $user = User::factory()->create()->assignRole('Administrator');

    for ($i = 0; $i < 15; $i++) {
        LoadTransaction::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subMinutes($i),
        ]);
    }

    for ($i = 0; $i < 15; $i++) {
        GcashTransaction::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subMinutes($i + 100),
        ]);
    }

    $response = $this->actingAs($user)->get(route('gcash.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('recentTransactions', 20)
        ->where('recentTransactions.0.kind', 'load')
    );
});
