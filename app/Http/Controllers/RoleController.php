<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->can('roles.manage'), 403);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions'   => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions'] ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role created.']);

        return back();
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        abort_unless($request->user()?->can('roles.manage'), 403);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'permissions'   => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role updated.']);

        return back();
    }

    public function destroy(Request $request, Role $role): RedirectResponse
    {
        abort_unless($request->user()?->can('roles.manage'), 403);

        if ($role->users()->count() > 0) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Cannot delete a role that has assigned users.']);

            return back();
        }

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role deleted.']);

        return back();
    }
}
