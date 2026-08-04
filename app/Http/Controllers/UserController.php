<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::with('roles')
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->string('role')->toString(), function ($query, string $role): void {
                $query->whereHas('roles', fn ($q) => $q->where('name', $role));
            })
            ->orderBy('name')
            ->paginate($this->perPage($request))
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
                'created_at' => $user->created_at,
            ]);

        return Inertia::render('users/index', [
            'users' => $users,
            'availableRoles' => Role::orderBy('name')->pluck('name'),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'role' => $request->string('role')->toString(),
            ],
        ]);
    }

    public function roles(): Response
    {
        abort_unless(request()->user()?->can('users.view'), 403);

        $roles = Role::with('permissions')->orderBy('name')->get()
            ->map(fn (Role $role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->pluck('name')->sort()->values(),
            ]);

        $permissions = Permission::orderBy('name')->pluck('name');

        return Inertia::render('users/roles', [
            'rolesList' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            'availableRoles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        $user->syncRoles([$data['role']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('users.index');
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
            ],
            'availableRoles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $data = $request->validated();

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        if (! empty($data['role']) && $request->user()->id !== $user->id) {
            $user->syncRoles([$data['role']]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('users.index');
    }
}
