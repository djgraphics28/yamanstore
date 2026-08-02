<?php

use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->admin = User::factory()->create()->assignRole('Administrator');
});

test('administrator can view the suppliers index', function () {
    Supplier::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->get(route('suppliers.index'));

    $response->assertOk();
});

test('administrator can create a supplier', function () {
    $response = $this->actingAs($this->admin)->post(route('suppliers.store'), [
        'name' => 'ABC Distributors',
        'contact_person' => 'Juan Dela Cruz',
        'phone' => '09171234567',
        'email' => 'juan@abcdistributors.com',
        'address' => '123 Main St, Manila',
        'is_active' => true,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('suppliers.index'));

    $this->assertDatabaseHas('suppliers', ['name' => 'ABC Distributors']);
});

test('creating a supplier without a name fails validation', function () {
    $response = $this->actingAs($this->admin)->post(route('suppliers.store'), [
        'name' => '',
    ]);

    $response->assertSessionHasErrors('name');
});

test('creating a supplier with an invalid email fails validation', function () {
    $response = $this->actingAs($this->admin)->post(route('suppliers.store'), [
        'name' => 'Test Supplier',
        'email' => 'not-an-email',
    ]);

    $response->assertSessionHasErrors('email');
});

test('administrator can update a supplier', function () {
    $supplier = Supplier::factory()->create(['name' => 'Old Supplier']);

    $response = $this->actingAs($this->admin)->put(route('suppliers.update', $supplier), [
        'name' => 'New Supplier',
        'is_active' => false,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('suppliers.index'));

    $supplier->refresh();
    expect($supplier->name)->toBe('New Supplier')
        ->and($supplier->is_active)->toBeFalse();
});

test('administrator can delete a supplier', function () {
    $supplier = Supplier::factory()->create();

    $response = $this->actingAs($this->admin)->delete(route('suppliers.destroy', $supplier));

    $response->assertRedirect(route('suppliers.index'));

    $this->assertSoftDeleted($supplier);
});

test('administrator can bulk delete suppliers', function () {
    $suppliers = Supplier::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->delete(route('suppliers.bulk-destroy'), [
        'ids' => $suppliers->pluck('id')->all(),
    ]);

    $response->assertRedirect(route('suppliers.index'));

    foreach ($suppliers as $supplier) {
        $this->assertSoftDeleted($supplier);
    }
});

test('bulk deleting suppliers requires at least one id', function () {
    $response = $this->actingAs($this->admin)->delete(route('suppliers.bulk-destroy'), [
        'ids' => [],
    ]);

    $response->assertSessionHasErrors('ids');
});
