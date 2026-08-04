import { Head, router } from '@inertiajs/react';
import { CheckIcon, PencilIcon, PlusIcon, TrashIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roleBadgeVariant } from '@/components/users/user-form';
import { usePermission } from '@/hooks/use-permission';
import { destroy as rolesDestroy, store as rolesStore, update as rolesUpdate } from '@/routes/roles';
import { index, roles } from '@/routes/users';
import type { UserRole } from '@/types';

type RoleData = {
    id: number;
    name: string;
    permissions: string[];
};

const RESOURCE_LABELS: Record<string, string> = {
    categories: 'Categories',
    gcash: 'GCash',
    pos: 'POS',
    print: 'Print',
    products: 'Products',
    roles: 'Roles',
    settings: 'Settings',
    suppliers: 'Suppliers',
    users: 'Users',
};

const ACTION_LABELS: Record<string, string> = {
    create: 'Create',
    delete: 'Delete',
    manage: 'Manage',
    update: 'Update',
    view: 'View',
    void: 'Void',
};

function PermissionGroup({
    resource,
    actions,
    selected,
    onToggle,
}: {
    resource: string;
    actions: string[];
    selected: string[];
    onToggle: (perm: string) => void;
}) {
    const allSelected = actions.every((a) => selected.includes(`${resource}.${a}`));

    function toggleAll() {
        if (allSelected) {
            onToggle(`__clear__${resource}`);
        } else {
            onToggle(`__selectAll__${resource}`);
        }
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {RESOURCE_LABELS[resource] ?? resource}
                </p>
                <button
                    type="button"
                    onClick={toggleAll}
                    className="text-[11px] text-primary hover:underline"
                >
                    {allSelected ? 'Deselect all' : 'Select all'}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pl-2">
                {actions.map((action) => {
                    const perm = `${resource}.${action}`;
                    return (
                        <div key={perm} className="flex items-center gap-2">
                            <Checkbox
                                id={perm}
                                checked={selected.includes(perm)}
                                onCheckedChange={() => onToggle(perm)}
                            />
                            <Label htmlFor={perm} className="cursor-pointer text-sm">
                                {ACTION_LABELS[action] ?? action}
                            </Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function RoleFormDialog({
    open,
    onOpenChange,
    title,
    description,
    initialName,
    initialPerms,
    grouped,
    submitLabel,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    initialName: string;
    initialPerms: string[];
    grouped: Record<string, string[]>;
    submitLabel: string;
    onSubmit: (name: string, perms: string[]) => void;
}) {
    const [name, setName] = useState(initialName);
    const [perms, setPerms] = useState<string[]>(initialPerms);
    const [busy, setBusy] = useState(false);

    // Sync when dialog opens with new initial values
    const [prevOpen, setPrevOpen] = useState(false);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setName(initialName);
            setPerms(initialPerms);
            setBusy(false);
        }
    }

    function handleToggle(perm: string) {
        if (perm.startsWith('__clear__')) {
            const resource = perm.slice('__clear__'.length);
            setPerms((p) => p.filter((x) => !x.startsWith(`${resource}.`)));
        } else if (perm.startsWith('__selectAll__')) {
            const resource = perm.slice('__selectAll__'.length);
            const toAdd = (grouped[resource] ?? []).map((a) => `${resource}.${a}`);
            setPerms((p) => [...new Set([...p, ...toAdd])]);
        } else {
            setPerms((p) => (p.includes(perm) ? p.filter((x) => x !== perm) : [...p, perm]));
        }
    }

    function handleSubmit() {
        setBusy(true);
        onSubmit(name, perms);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-5 overflow-y-auto py-2 pr-1">
                    <div className="space-y-1.5">
                        <Label htmlFor={`${title}-name`}>Role Name</Label>
                        <Input
                            id={`${title}-name`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Supervisor"
                        />
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-medium">Permissions</p>
                        {Object.entries(grouped).map(([resource, actions]) => (
                            <PermissionGroup
                                key={resource}
                                resource={resource}
                                actions={actions}
                                selected={perms}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!name.trim() || busy}>
                        {busy ? 'Saving…' : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function RolesPage({
    rolesList,
    permissions,
}: {
    rolesList: RoleData[];
    permissions: string[];
}) {
    const canManage = usePermission('roles.manage');

    const grouped = permissions.reduce<Record<string, string[]>>((acc, perm) => {
        const dot = perm.indexOf('.');
        const resource = dot >= 0 ? perm.slice(0, dot) : perm;
        const action = dot >= 0 ? perm.slice(dot + 1) : 'manage';
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(action);
        return acc;
    }, {});

    const [createOpen, setCreateOpen] = useState(false);
    const [editRole, setEditRole] = useState<RoleData | null>(null);
    const [deleteRole, setDeleteRole] = useState<RoleData | null>(null);
    const [deleting, setDeleting] = useState(false);

    function handleCreate(name: string, perms: string[]) {
        router.post(
            rolesStore().url,
            { name, permissions: perms },
            {
                preserveScroll: true,
                onSuccess: () => setCreateOpen(false),
                onError: () => {},
            },
        );
    }

    function handleEdit(name: string, perms: string[]) {
        if (!editRole) return;
        router.put(
            rolesUpdate(editRole.id).url,
            { name, permissions: perms },
            {
                preserveScroll: true,
                onSuccess: () => setEditRole(null),
                onError: () => {},
            },
        );
    }

    function handleDelete() {
        if (!deleteRole) return;
        setDeleting(true);
        router.delete(rolesDestroy(deleteRole.id).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteRole(null),
            onFinish: () => setDeleting(false),
        });
    }

    const hasPermission = (role: RoleData, perm: string) => role.permissions.includes(perm);

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Roles & Permissions"
                        description="Manage roles and what each role can do in the system"
                    />
                    {canManage && (
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                            <PlusIcon className="mr-1.5 h-4 w-4" />
                            New Role
                        </Button>
                    )}
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="w-32 px-4 py-3 text-left font-medium text-muted-foreground">
                                    Module
                                </th>
                                <th className="w-24 px-4 py-3 text-left font-medium text-muted-foreground">
                                    Action
                                </th>
                                {rolesList.map((role) => (
                                    <th key={role.name} className="px-4 py-3 text-center font-medium">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <Badge variant={roleBadgeVariant(role.name as UserRole)}>
                                                {role.name}
                                            </Badge>
                                            {canManage && (
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        title={`Edit ${role.name}`}
                                                        className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        onClick={() => setEditRole(role)}
                                                    >
                                                        <PencilIcon className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title={`Delete ${role.name}`}
                                                        className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setDeleteRole(role)}
                                                    >
                                                        <TrashIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(grouped).map(([resource, actions]) =>
                                actions.map((action, actionIdx) => {
                                    const perm = `${resource}.${action}`;
                                    return (
                                        <tr
                                            key={perm}
                                            className="border-b last:border-0 transition-colors hover:bg-muted/30"
                                        >
                                            {actionIdx === 0 ? (
                                                <td
                                                    rowSpan={actions.length}
                                                    className="border-r px-4 py-2.5 pt-3 align-top font-medium"
                                                >
                                                    {RESOURCE_LABELS[resource] ?? resource}
                                                </td>
                                            ) : null}
                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                {ACTION_LABELS[action] ?? action}
                                            </td>
                                            {rolesList.map((role) => (
                                                <td key={role.name} className="px-4 py-2.5 text-center">
                                                    {hasPermission(role, perm) ? (
                                                        <CheckIcon className="mx-auto size-4 text-emerald-500" />
                                                    ) : (
                                                        <XIcon className="mx-auto size-4 text-muted-foreground/40" />
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                }),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RoleFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                title="Create Role"
                description="Add a new role and assign its permissions."
                initialName=""
                initialPerms={[]}
                grouped={grouped}
                submitLabel="Create Role"
                onSubmit={handleCreate}
            />

            <RoleFormDialog
                open={!!editRole}
                onOpenChange={(open) => !open && setEditRole(null)}
                title="Edit Role"
                description="Update the role name and its permissions."
                initialName={editRole?.name ?? ''}
                initialPerms={editRole?.permissions ?? []}
                grouped={grouped}
                submitLabel="Save Changes"
                onSubmit={handleEdit}
            />

            <Dialog open={!!deleteRole} onOpenChange={(open) => !open && setDeleteRole(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the{' '}
                            <strong>{deleteRole?.name}</strong> role? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteRole(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Delete Role'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RolesPage.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Roles & Permissions', href: roles() },
    ],
};
