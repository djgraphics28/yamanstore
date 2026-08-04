import { Head, Link, router, usePage } from '@inertiajs/react';
import { PencilIcon, PlusIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { PaginationBar } from '@/components/pagination-bar';
import { SearchInput } from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { roleBadgeVariant } from '@/components/users/user-form';
import { usePermission } from '@/hooks/use-permission';
import { create, destroy, edit, index, roles } from '@/routes/users';
import type { Auth, Paginated, UserRecord } from '@/types';

export default function UsersIndex({
    users,
    availableRoles,
    filters,
}: {
    users: Paginated<UserRecord>;
    availableRoles: string[];
    filters: { search: string; role: string };
}) {
    const canCreate = usePermission('users.create');
    const canUpdate = usePermission('users.update');
    const canDelete = usePermission('users.delete');

    const { auth } = usePage<{ auth: Auth }>().props;
    const authUserId = auth.user.id;

    const handleSearch = (search: string) => {
        router.get(
            index().url,
            { search: search || undefined, role: filters.role || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleRoleFilter = (role: string) => {
        router.get(
            index().url,
            { search: filters.search || undefined, role: role || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            index().url,
            {
                search: filters.search || undefined,
                role: filters.role || undefined,
                per_page: perPage,
            },
            { preserveState: true, replace: true },
        );
    };

    const columns: ColumnDef<UserRecord, unknown>[] = [
        {
            id: 'name',
            accessorFn: (row) => row.name,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {row.original.email}
                    </p>
                </div>
            ),
        },
        {
            id: 'role',
            accessorFn: (row) => row.role ?? '',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }) =>
                row.original.role ? (
                    <Badge variant={roleBadgeVariant(row.original.role)}>
                        {row.original.role}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                ),
        },
        {
            id: 'created_at',
            accessorFn: (row) => row.created_at,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Joined" />
            ),
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: '',
            enableHiding: false,
            meta: { className: 'text-right' },
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    {canUpdate && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={edit(row.original.id)}>
                                <PencilIcon className="size-4" />
                                <span className="sr-only">Edit</span>
                            </Link>
                        </Button>
                    )}
                    {canDelete && row.original.id !== authUserId && (
                        <DeleteConfirmDialog
                            url={destroy(row.original.id).url}
                            title="Delete this user?"
                            description="This user will be permanently removed and will no longer be able to log in."
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Users"
                        description="Manage staff accounts and role assignments"
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={roles()}>
                                <ShieldCheckIcon className="size-4" />
                                Roles & Permissions
                            </Link>
                        </Button>
                        {canCreate && (
                            <Button asChild>
                                <Link href={create()}>
                                    <PlusIcon className="size-4" />
                                    Add user
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <SearchInput
                        initialValue={filters.search}
                        onSearch={handleSearch}
                        placeholder="Search name or email…"
                        className="w-64"
                    />
                    <Select
                        value={filters.role || '__all__'}
                        onValueChange={(v) =>
                            handleRoleFilter(v === '__all__' ? '' : v)
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All roles</SelectItem>
                            {availableRoles.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {users.data.length === 0 ? (
                    <EmptyState
                        icon={UsersIcon}
                        title="No users found"
                        description={
                            filters.search || filters.role
                                ? 'Try adjusting your filters.'
                                : 'Add your first staff account to get started.'
                        }
                    />
                ) : (
                    <DataTable
                        data={users.data}
                        columns={columns}
                        renderMobileCard={(row) => (
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">{row.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {row.email}
                                    </p>
                                    {row.role && (
                                        <Badge
                                            className="mt-1"
                                            variant={roleBadgeVariant(row.role)}
                                        >
                                            {row.role}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    {canUpdate && (
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={edit(row.id)}>
                                                <PencilIcon className="size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                    {canDelete && row.id !== authUserId && (
                                        <DeleteConfirmDialog
                                            url={destroy(row.id).url}
                                            title="Delete this user?"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    />
                )}

                <PaginationBar
                    links={users.links}
                    meta={{
                        current_page: users.current_page,
                        last_page: users.last_page,
                        per_page: users.per_page,
                        total: users.total,
                        from: users.from,
                        to: users.to,
                    }}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: index() }],
};
