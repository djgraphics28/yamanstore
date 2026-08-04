import { Head, Link, router } from '@inertiajs/react';
import type { RowSelectionState } from '@tanstack/react-table';
import { PackageIcon, PencilIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { ProductImportDialog } from '@/components/products/product-import-dialog';
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
import { bulkDestroy, create, destroy, edit, index } from '@/routes/products';
import type { Category, Paginated, ProductStatus } from '@/types';

type ProductListItem = {
    id: number;
    name: string;
    sku: string;
    barcode: string | null;
    category: { id: number; name: string };
    brand: string | null;
    supplier: { id: number; name: string } | null;
    cost_price: string;
    selling_price: string;
    unit: string;
    current_stock: number;
    minimum_stock: number;
    expiration_date: string | null;
    image_url: string | null;
    status: ProductStatus;
};

function StockBadge({
    currentStock,
    minimumStock,
}: {
    currentStock: number;
    minimumStock: number;
}) {
    if (currentStock <= 0) {
        return <Badge variant="destructive">Out of stock</Badge>;
    }

    if (currentStock <= minimumStock) {
        return (
            <Badge className="border-transparent bg-orange-500 text-white hover:bg-orange-500/90">
                Low stock
            </Badge>
        );
    }

    return <Badge variant="secondary">{currentStock} in stock</Badge>;
}

export default function ProductsIndex({
    products,
    categories,
    filters,
}: {
    products: Paginated<ProductListItem>;
    categories: Category[];
    filters: { search: string; category_id: number | null; status: string };
}) {
    const canCreate = usePermission('products.create');
    const canUpdate = usePermission('products.update');
    const canDelete = usePermission('products.delete');

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [importOpen, setImportOpen] = useState(false);
    const selectedIds = Object.keys(rowSelection).filter(
        (id) => rowSelection[id],
    );

    const applyFilters = (next: Partial<typeof filters>) => {
        router.get(
            index().url,
            {
                search: next.search ?? filters.search ?? undefined,
                category_id: next.category_id ?? filters.category_id ?? undefined,
                status: next.status ?? filters.status ?? undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            index().url,
            {
                search: filters.search || undefined,
                category_id: filters.category_id || undefined,
                status: filters.status || undefined,
                per_page: perPage,
            },
            { preserveState: true, replace: true },
        );
    };

    const columns: ColumnDef<ProductListItem, unknown>[] = [
        {
            id: 'product',
            accessorFn: (row) => row.name,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Product" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {row.original.image_url ? (
                            <img
                                src={row.original.image_url}
                                alt={row.original.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <PackageIcon className="size-4 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.sku}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'category',
            accessorFn: (row) => row.category.name,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Category" />
            ),
            cell: ({ row }) => row.original.category.name,
        },
        {
            id: 'stock',
            accessorFn: (row) => row.current_stock,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Stock" />
            ),
            cell: ({ row }) => (
                <StockBadge
                    currentStock={row.original.current_stock}
                    minimumStock={row.original.minimum_stock}
                />
            ),
        },
        {
            id: 'price',
            accessorFn: (row) => Number(row.selling_price),
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Price" />
            ),
            cell: ({ row }) => `₱${row.original.selling_price}`,
        },
        {
            id: 'status',
            accessorFn: (row) => row.status,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.status === 'active'
                            ? 'default'
                            : 'secondary'
                    }
                >
                    {row.original.status === 'active' ? 'Active' : 'Inactive'}
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
                            description="This product will be moved to trash."
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Products"
                        description="Manage your store's product catalog"
                    />
                    {canCreate && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setImportOpen(true)}>
                                <UploadIcon className="size-4" />
                                Import
                            </Button>
                            <Button asChild>
                                <Link href={create()}>
                                    <PlusIcon className="size-4" />
                                    Add product
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        initialValue={filters.search}
                        placeholder="Search by name, SKU, or barcode…"
                        onSearch={(search) => applyFilters({ search })}
                        className="max-w-sm"
                    />

                    <Select
                        value={filters.category_id?.toString() ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                category_id:
                                    value === 'all' ? null : Number(value),
                            })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === 'all' ? '' : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {canDelete && (
                    <BulkActionsBar
                        ids={selectedIds}
                        deleteUrl={bulkDestroy().url}
                        label="product"
                        onClear={() => setRowSelection({})}
                        onDeleted={() => setRowSelection({})}
                    />
                )}

                {products.data.length === 0 ? (
                    <EmptyState
                        icon={PackageIcon}
                        title="No products found"
                        description="Try different filters, or add your first product."
                        action={
                            canCreate ? (
                                <Button asChild>
                                    <Link href={create()}>Add product</Link>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <DataTable
                            data={products.data}
                            columns={columns}
                            rowSelection={canDelete ? rowSelection : undefined}
                            onRowSelectionChange={
                                canDelete ? setRowSelection : undefined
                            }
                            renderMobileCard={(row) => (
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                            {row.image_url ? (
                                                <img
                                                    src={row.image_url}
                                                    alt={row.name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <PackageIcon className="size-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {row.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {row.sku} · ₱
                                                {row.selling_price}
                                            </p>
                                            <div className="mt-1 flex gap-1">
                                                <StockBadge
                                                    currentStock={
                                                        row.current_stock
                                                    }
                                                    minimumStock={
                                                        row.minimum_stock
                                                    }
                                                />
                                            </div>
                                        </div>
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
                            links={products.links}
                            meta={{
                                current_page: products.current_page,
                                last_page: products.last_page,
                                per_page: products.per_page,
                                total: products.total,
                                from: products.from,
                                to: products.to,
                            }}
                            onPerPageChange={handlePerPageChange}
                        />
                    </>
                )}
            </div>
            <ProductImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                onImported={() => router.reload({ only: ['products'] })}
            />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [{ title: 'Products', href: index() }],
};
