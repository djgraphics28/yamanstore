import { Head, Link, router } from '@inertiajs/react';
import type { RowSelectionState } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TagsIcon } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePermission } from '@/hooks/use-permission';
import { bulkDestroy, create, destroy, edit, index } from '@/routes/categories';
import type { Category, Paginated } from '@/types';

export default function CategoriesIndex({
    categories,
    majorCategories,
    filters,
}: {
    categories: Paginated<Category>;
    majorCategories: { id: number; name: string }[];
    filters: { search: string; major_id: number | null };
}) {
    const canCreate = usePermission('categories.create');
    const canUpdate = usePermission('categories.update');
    const canDelete = usePermission('categories.delete');

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const selectedIds = Object.keys(rowSelection).filter(
        (id) => rowSelection[id],
    );

    const handleSearch = (search: string) => {
        router.get(
            index().url,
            {
                search: search || undefined,
                major_id: filters.major_id || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleMajorFilterChange = (majorId: number | null) => {
        router.get(
            index().url,
            {
                search: filters.search || undefined,
                major_id: majorId || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            index().url,
            {
                search: filters.search || undefined,
                major_id: filters.major_id || undefined,
                per_page: perPage,
            },
            { preserveState: true, replace: true },
        );
    };

    const columns: ColumnDef<Category, unknown>[] = [
        {
            id: 'name',
            accessorFn: (row) => row.name,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => row.original.name,
        },
        {
            id: 'parent',
            accessorFn: (row) => row.parent?.name ?? '',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Parent" />
            ),
            cell: ({ row }) =>
                row.original.parent ? (
                    row.original.parent.name
                ) : (
                    <Badge variant="outline">Major</Badge>
                ),
        },
        {
            id: 'products_count',
            accessorFn: (row) => row.products_count ?? 0,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Products" />
            ),
            cell: ({ row }) => row.original.products_count ?? 0,
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
                            description="This category will be moved to trash. Products using it cannot be deleted until reassigned."
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Categories" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Categories"
                        description="Organize your products into categories"
                    />
                    {canCreate && (
                        <Button asChild>
                            <Link href={create()}>
                                <PlusIcon className="size-4" />
                                Add category
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        initialValue={filters.search}
                        placeholder="Search categories…"
                        onSearch={handleSearch}
                        className="max-w-sm"
                    />

                    <Select
                        value={filters.major_id?.toString() ?? 'all'}
                        onValueChange={(value) =>
                            handleMajorFilterChange(
                                value === 'all' ? null : Number(value),
                            )
                        }
                    >
                        <SelectTrigger className="w-full sm:w-56">
                            <SelectValue placeholder="All major categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All major categories
                            </SelectItem>
                            {majorCategories.map((major) => (
                                <SelectItem
                                    key={major.id}
                                    value={major.id.toString()}
                                >
                                    {major.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {canDelete && (
                    <BulkActionsBar
                        ids={selectedIds}
                        deleteUrl={bulkDestroy().url}
                        label="category"
                        onClear={() => setRowSelection({})}
                        onDeleted={() => setRowSelection({})}
                    />
                )}

                {categories.data.length === 0 ? (
                    <EmptyState
                        icon={TagsIcon}
                        title="No categories found"
                        description="Try a different search, or create your first category."
                        action={
                            canCreate ? (
                                <Button asChild>
                                    <Link href={create()}>Add category</Link>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <DataTable
                            data={categories.data}
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
                                            {row.parent
                                                ? row.parent.name
                                                : 'Major'}{' '}
                                            · {row.products_count ?? 0}{' '}
                                            products
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
                            links={categories.links}
                            meta={{
                                current_page: categories.current_page,
                                last_page: categories.last_page,
                                per_page: categories.per_page,
                                total: categories.total,
                                from: categories.from,
                                to: categories.to,
                            }}
                            onPerPageChange={handlePerPageChange}
                        />
                    </>
                )}
            </div>
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [{ title: 'Categories', href: index() }],
};
