import { Head, Link, router } from '@inertiajs/react';
import type { RowSelectionState } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TruckIcon } from 'lucide-react';
import { useState } from 'react';
import { BulkActionsBar } from '@/components/bulk-actions-bar';
import {  DataTable } from '@/components/data-table';
import type {ColumnDef} from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { PaginationBar } from '@/components/pagination-bar';
import { SearchInput } from '@/components/search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';
import { bulkDestroy, create, destroy, edit, index } from '@/routes/suppliers';
import type { Paginated, Supplier } from '@/types';

export default function SuppliersIndex({
    suppliers,
    filters,
}: {
    suppliers: Paginated<Supplier>;
    filters: { search: string };
}) {
    const canCreate = usePermission('suppliers.create');
    const canUpdate = usePermission('suppliers.update');
    const canDelete = usePermission('suppliers.delete');

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const selectedIds = Object.keys(rowSelection).filter(
        (id) => rowSelection[id],
    );

    const handleSearch = (search: string) => {
        router.get(
            index().url,
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            index().url,
            { search: filters.search || undefined, per_page: perPage },
            { preserveState: true, replace: true },
        );
    };

    const columns: ColumnDef<Supplier, unknown>[] = [
        {
            id: 'name',
            accessorFn: (row) => row.name,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => row.original.name,
        },
        {
            id: 'contact_person',
            accessorFn: (row) => row.contact_person ?? '',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Contact" />
            ),
            cell: ({ row }) => row.original.contact_person ?? '—',
        },
        {
            id: 'phone',
            accessorFn: (row) => row.phone ?? '',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }) => row.original.phone ?? '—',
        },
        {
            id: 'is_active',
            accessorFn: (row) => row.is_active,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
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
                            <Link href={edit(row.original)}>
                                <PencilIcon className="size-4" />
                                <span className="sr-only">Edit</span>
                            </Link>
                        </Button>
                    )}
                    {canDelete && (
                        <DeleteConfirmDialog
                            url={destroy(row.original).url}
                            title={`Delete ${row.original.name}?`}
                            description="This supplier will be moved to trash."
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Suppliers" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Suppliers"
                        description="Manage the suppliers you buy stock from"
                    />
                    {canCreate && (
                        <Button asChild>
                            <Link href={create()}>
                                <PlusIcon className="size-4" />
                                Add supplier
                            </Link>
                        </Button>
                    )}
                </div>

                <SearchInput
                    initialValue={filters.search}
                    placeholder="Search suppliers…"
                    onSearch={handleSearch}
                    className="max-w-sm"
                />

                {canDelete && (
                    <BulkActionsBar
                        ids={selectedIds}
                        deleteUrl={bulkDestroy().url}
                        label="supplier"
                        onClear={() => setRowSelection({})}
                        onDeleted={() => setRowSelection({})}
                    />
                )}

                {suppliers.data.length === 0 ? (
                    <EmptyState
                        icon={TruckIcon}
                        title="No suppliers found"
                        description="Try a different search, or add your first supplier."
                        action={
                            canCreate ? (
                                <Button asChild>
                                    <Link href={create()}>Add supplier</Link>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <DataTable
                            data={suppliers.data}
                            columns={columns}
                            rowSelection={canDelete ? rowSelection : undefined}
                            onRowSelectionChange={
                                canDelete ? setRowSelection : undefined
                            }
                            renderMobileCard={(row) => (
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">
                                            {row.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {row.contact_person ?? '—'}
                                            {row.phone
                                                ? ` · ${row.phone}`
                                                : ''}
                                        </p>
                                        <Badge
                                            variant={
                                                row.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="mt-1"
                                        >
                                            {row.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-1">
                                        {canUpdate && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link href={edit(row)}>
                                                    <PencilIcon className="size-4" />
                                                </Link>
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <DeleteConfirmDialog
                                                url={destroy(row).url}
                                                title={`Delete ${row.name}?`}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        />

                        <PaginationBar
                            links={suppliers.links}
                            meta={{
                                current_page: suppliers.current_page,
                                last_page: suppliers.last_page,
                                per_page: suppliers.per_page,
                                total: suppliers.total,
                                from: suppliers.from,
                                to: suppliers.to,
                            }}
                            onPerPageChange={handlePerPageChange}
                        />
                    </>
                )}
            </div>
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: [{ title: 'Suppliers', href: index() }],
};
