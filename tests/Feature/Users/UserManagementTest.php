<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

// ── Index / list ───────────────────────────────────────────────────────────

test('administrator can view user index', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    $this->actingAs($admin)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('users/index'));
});

test('manager can view user index', function () {
    $manager = User::factory()->create()->assignRole('Manager');

    $this->actingAs($manager)
        ->get(route('users.index'))
        ->assertOk();
});

test('cashier cannot view user index', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)
        ->get(route('users.index'))
        ->assertForbidden();
});

test('inventory staff cannot view user index', function () {
    $staff = User::factory()->create()->assignRole('Inventory Staff');

    $this->actingAs($staff)
        ->get(route('users.index'))
        ->assertForbidden();
});

test('unauthenticated user is redirected from user index', function () {
    $this->get(route('users.index'))
        ->assertRedirect(route('login'));
});

// ── Roles & Permissions matrix ─────────────────────────────────────────────

test('administrator can view roles and permissions matrix', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    $this->actingAs($admin)
        ->get(route('users.roles'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('users/roles'));
});

test('cashier cannot view roles and permissions matrix', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)
        ->get(route('users.roles'))
        ->assertForbidden();
});

// ── Create ─────────────────────────────────────────────────────────────────

test('administrator can create a new user', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    $response = $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'New Staff',
        'email' => 'newstaff@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'Cashier',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', [
        'name' => 'New Staff',
        'email' => 'newstaff@example.com',
    ]);

    $created = User::where('email', 'newstaff@example.com')->first();
    expect($created->getRoleNames()->first())->toBe('Cashier');
    expect($created->email_verified_at)->not->toBeNull();
});

test('manager can create a new user', function () {
    $manager = User::factory()->create()->assignRole('Manager');

    $this->actingAs($manager)->post(route('users.store'), [
        'name' => 'Another Staff',
        'email' => 'another@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'Cashier',
    ])->assertSessionHasNoErrors()->assertRedirect(route('users.index'));
});

test('cashier cannot create a user', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->post(route('users.store'), [
        'name' => 'Attempt',
        'email' => 'attempt@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'Cashier',
    ])->assertForbidden();
});

test('store validates duplicate email', function () {
    $admin = User::factory()->create(['email' => 'existing@example.com'])->assignRole('Administrator');

    $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Duplicate',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'Cashier',
    ])->assertSessionHasErrors('email');
});

test('store validates password confirmation', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'wrong',
        'role' => 'Cashier',
    ])->assertSessionHasErrors('password');
});

test('store rejects invalid role', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'SuperAdmin',
    ])->assertSessionHasErrors('role');
});

// ── Update ─────────────────────────────────────────────────────────────────

test('administrator can update another user', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $target = User::factory()->create(['name' => 'Old Name'])->assignRole('Cashier');

    $this->actingAs($admin)->put(route('users.update', $target), [
        'name' => 'New Name',
        'email' => $target->email,
        'role' => 'Manager',
    ])->assertSessionHasNoErrors()->assertRedirect(route('users.index'));

    expect($target->fresh()->name)->toBe('New Name');
    expect($target->fresh()->getRoleNames()->first())->toBe('Manager');
});

test('update can change password when provided', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $target = User::factory()->create()->assignRole('Cashier');
    $oldHash = $target->password;

    $this->actingAs($admin)->put(route('users.update', $target), [
        'name' => $target->name,
        'email' => $target->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
        'role' => 'Cashier',
    ])->assertSessionHasNoErrors();

    expect($target->fresh()->password)->not->toBe($oldHash);
});

test('update skips password change when field is empty', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $target = User::factory()->create()->assignRole('Cashier');
    $oldHash = $target->password;

    $this->actingAs($admin)->put(route('users.update', $target), [
        'name' => $target->name,
        'email' => $target->email,
        'role' => 'Cashier',
    ])->assertSessionHasNoErrors();

    expect($target->fresh()->password)->toBe($oldHash);
});

test('administrator cannot change their own role', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    $this->actingAs($admin)->put(route('users.update', $admin), [
        'name' => $admin->name,
        'email' => $admin->email,
        'role' => 'Cashier',
    ])->assertSessionHasNoErrors();

    expect($admin->fresh()->getRoleNames()->first())->toBe('Administrator');
});

test('cashier cannot update a user', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $target = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($cashier)->put(route('users.update', $target), [
        'name' => 'Hacked Name',
        'email' => $target->email,
        'role' => 'Manager',
    ])->assertForbidden();
});

test('update validates duplicate email ignoring self', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $other = User::factory()->create(['email' => 'other@example.com'])->assignRole('Cashier');

    $this->actingAs($admin)->put(route('users.update', $admin), [
        'name' => $admin->name,
        'email' => 'other@example.com',
    ])->assertSessionHasErrors('email');

    $this->actingAs($admin)->put(route('users.update', $admin), [
        'name' => $admin->name,
        'email' => $admin->email,
    ])->assertSessionHasNoErrors();
});

// ── Delete ─────────────────────────────────────────────────────────────────

test('administrator can delete another user', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    $target = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($admin)
        ->delete(route('users.destroy', $target))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('administrator cannot delete themselves', function () {
    $admin = User::factory()->create()->assignRole('Administrator');

    $this->actingAs($admin)
        ->delete(route('users.destroy', $admin))
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('manager cannot delete a user', function () {
    $manager = User::factory()->create()->assignRole('Manager');
    $target = User::factory()->create()->assignRole('Cashier');

    $this->actingAs($manager)
        ->delete(route('users.destroy', $target))
        ->assertForbidden();
});

test('cashier cannot delete a user', function () {
    $cashier = User::factory()->create()->assignRole('Cashier');
    $target = User::factory()->create()->assignRole('Inventory Staff');

    $this->actingAs($cashier)
        ->delete(route('users.destroy', $target))
        ->assertForbidden();
});

// ── Search / filter ────────────────────────────────────────────────────────

test('index search filters by name', function () {
    $admin = User::factory()->create(['name' => 'Admin User'])->assignRole('Administrator');
    User::factory()->create(['name' => 'Alice Smith'])->assignRole('Cashier');
    User::factory()->create(['name' => 'Bob Jones'])->assignRole('Cashier');

    $response = $this->actingAs($admin)
        ->get(route('users.index', ['search' => 'Alice']))
        ->assertOk();

    $users = $response->original->getData()['page']['props']['users']['data'];
    expect($users)->toHaveCount(1);
    expect($users[0]['name'])->toBe('Alice Smith');
});

test('index filters by role', function () {
    $admin = User::factory()->create()->assignRole('Administrator');
    User::factory()->create()->assignRole('Cashier');
    User::factory()->create()->assignRole('Manager');

    $response = $this->actingAs($admin)
        ->get(route('users.index', ['role' => 'Cashier']))
        ->assertOk();

    $users = $response->original->getData()['page']['props']['users']['data'];
    foreach ($users as $u) {
        expect($u['role'])->toBe('Cashier');
    }
});
