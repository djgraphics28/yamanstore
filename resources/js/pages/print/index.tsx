import { Head } from '@inertiajs/react';
import { BanknoteIcon, FileTextIcon, PrinterIcon } from 'lucide-react';
import PrintTransactionController from '@/actions/App/Http/Controllers/PrintTransactionController';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { DateRangePicker } from '@/components/date-range-picker';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { PrintTransactionDialog } from '@/components/print/print-transaction-dialog';
import { StatCard } from '@/components/stat-card';
import { usePermission } from '@/hooks/use-permission';
import { index } from '@/routes/print';
import type {
    PrintRecentTransaction,
    PrintServiceOption,
    PrintSummary,
} from '@/types';

function periodLabel(dateFrom: string, dateTo: string): string {
    const today = new Date().toISOString().slice(0, 10);
    if (dateFrom === dateTo) {
        return dateFrom === today ? 'today' : dateFrom;
    }
    return `${dateFrom} – ${dateTo}`;
}

export default function PrintIndex({
    summary,
    recentTransactions,
    serviceTypes,
    dateFrom,
    dateTo,
}: {
    summary: PrintSummary;
    recentTransactions: PrintRecentTransaction[];
    serviceTypes: PrintServiceOption[];
    dateFrom: string;
    dateTo: string;
}) {
    const canCreate = usePermission('print.create');
    const canUpdate = usePermission('print.update');
    const canDelete = usePermission('print.delete');

    const label = periodLabel(dateFrom, dateTo);

    const columns: ColumnDef<PrintRecentTransaction, unknown>[] = [
        {
            id: 'service',
            accessorFn: (row) => row.service_label,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Service" />
            ),
            cell: ({ row }) => row.original.service_label,
        },
        {
            id: 'paper_size',
            accessorFn: (row) => row.paper_label,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Size" />
            ),
            cell: ({ row }) => row.original.paper_label,
        },
        {
            id: 'pages',
            accessorFn: (row) => row.pages,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Pages" />
            ),
            cell: ({ row }) => row.original.pages,
        },
        {
            id: 'unit_price',
            accessorFn: (row) => row.unit_price,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Unit price" />
            ),
            cell: ({ row }) => `₱${row.original.unit_price}`,
        },
        {
            id: 'total_amount',
            accessorFn: (row) => row.total_amount,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Total" />
            ),
            cell: ({ row }) => `₱${row.original.total_amount}`,
        },
        {
            id: 'user',
            accessorFn: (row) => row.user,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Cashier" />
            ),
            cell: ({ row }) => row.original.user,
        },
        {
            id: 'created_at',
            accessorFn: (row) => row.created_at,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Time" />
            ),
            cell: ({ row }) =>
                new Date(row.original.created_at).toLocaleString(),
        },
        {
            id: 'actions',
            header: '',
            enableHiding: false,
            meta: { className: 'text-right' },
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    {canUpdate && (
                        <PrintTransactionDialog
                            serviceTypes={serviceTypes}
                            transaction={{
                                id: row.original.id,
                                service_type: row.original.service_type,
                                paper_size: row.original.paper_size,
                                pages: row.original.pages,
                                notes: row.original.notes,
                            }}
                        />
                    )}
                    {canDelete && (
                        <DeleteConfirmDialog
                            url={
                                PrintTransactionController.destroy(
                                    row.original.id,
                                ).url
                            }
                            title="Delete this print job?"
                            description="This record will be moved to trash."
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Print" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Print / Scan / Photocopy"
                        description="Track printing, scanning, and photocopy jobs"
                    />
                    {canCreate && (
                        <PrintTransactionDialog serviceTypes={serviceTypes} />
                    )}
                </div>

                <DateRangePicker
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    url={index().url}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title={`Revenue (${label})`}
                        value={`₱${summary.revenue}`}
                        caption={`${summary.count} jobs · ${summary.pages} pages`}
                        icon={BanknoteIcon}
                    />
                    <StatCard
                        title={`Jobs (${label})`}
                        value={String(summary.count)}
                        caption="Total print/scan/copy jobs"
                        icon={PrinterIcon}
                    />
                    <StatCard
                        title={`Pages (${label})`}
                        value={String(summary.pages)}
                        caption="Total pages processed"
                        icon={FileTextIcon}
                    />
                </div>

                {recentTransactions.length === 0 ? (
                    <EmptyState
                        icon={PrinterIcon}
                        title="No jobs yet"
                        description="Record your first print, scan, or photocopy job to get started."
                    />
                ) : (
                    <DataTable
                        data={recentTransactions}
                        columns={columns}
                        renderMobileCard={(row) => (
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">
                                        {row.service_label} · {row.paper_label}{' '}
                                        · {row.pages} page
                                        {row.pages !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ₱{row.total_amount} · {row.user} ·{' '}
                                        {new Date(
                                            row.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {canUpdate && (
                                        <PrintTransactionDialog
                                            serviceTypes={serviceTypes}
                                            transaction={{
                                                id: row.id,
                                                service_type: row.service_type,
                                                paper_size: row.paper_size,
                                                pages: row.pages,
                                                notes: row.notes,
                                            }}
                                        />
                                    )}
                                    {canDelete && (
                                        <DeleteConfirmDialog
                                            url={
                                                PrintTransactionController.destroy(
                                                    row.id,
                                                ).url
                                            }
                                            title="Delete this print job?"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    />
                )}
            </div>
        </>
    );
}

PrintIndex.layout = {
    breadcrumbs: [{ title: 'Print', href: index() }],
};
