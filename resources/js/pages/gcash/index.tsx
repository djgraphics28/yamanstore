import { Head } from '@inertiajs/react';
import { BanknoteIcon, SmartphoneIcon, WalletIcon } from 'lucide-react';
import GcashTransactionController from '@/actions/App/Http/Controllers/GcashTransactionController';
import LoadTransactionController from '@/actions/App/Http/Controllers/LoadTransactionController';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { GcashTransactionDialog } from '@/components/gcash/gcash-transaction-dialog';
import { LoadTransactionDialog } from '@/components/gcash/load-transaction-dialog';
import Heading from '@/components/heading';
import { StatCard } from '@/components/stat-card';
import { usePermission } from '@/hooks/use-permission';
import { index } from '@/routes/gcash';
import type { GcashRecentTransaction, GcashSummary } from '@/types';

type Row = Omit<GcashRecentTransaction, 'id'> & { id: string; recordId: number };

export default function GcashIndex({
    summary,
    recentTransactions,
    networks,
}: {
    summary: GcashSummary;
    recentTransactions: GcashRecentTransaction[];
    networks: { value: string; label: string }[];
}) {
    const canCreate = usePermission('gcash.create');
    const canUpdate = usePermission('gcash.update');
    const canDelete = usePermission('gcash.delete');

    const rows: Row[] = recentTransactions.map((transaction) => ({
        ...transaction,
        id: `${transaction.kind}-${transaction.id}`,
        recordId: transaction.id,
    }));

    const columns: ColumnDef<Row, unknown>[] = [
        {
            id: 'label',
            accessorFn: (row) => row.label,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }) => row.original.label,
        },
        {
            id: 'amount',
            accessorFn: (row) => row.amount,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Amount" />
            ),
            cell: ({ row }) => `₱${row.original.amount}`,
        },
        {
            id: 'service_fee',
            accessorFn: (row) => row.service_fee,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Fee" />
            ),
            cell: ({ row }) => `₱${row.original.service_fee}`,
        },
        {
            id: 'reference_number',
            accessorFn: (row) => row.reference_number ?? '',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Reference" />
            ),
            cell: ({ row }) => row.original.reference_number ?? '—',
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
                    {canUpdate &&
                        (row.original.kind === 'load' ? (
                            <LoadTransactionDialog
                                networks={networks}
                                transaction={{
                                    id: row.original.recordId,
                                    network: row.original.network!,
                                    amount: row.original.amount,
                                    reference_number:
                                        row.original.reference_number,
                                    notes: row.original.notes,
                                }}
                            />
                        ) : (
                            <GcashTransactionDialog
                                transaction={{
                                    id: row.original.recordId,
                                    type: row.original.type!,
                                    amount: row.original.amount,
                                    reference_number:
                                        row.original.reference_number,
                                    notes: row.original.notes,
                                }}
                            />
                        ))}
                    {canDelete && (
                        <DeleteConfirmDialog
                            url={
                                row.original.kind === 'load'
                                    ? LoadTransactionController.destroy(
                                          row.original.recordId,
                                      ).url
                                    : GcashTransactionController.destroy(
                                          row.original.recordId,
                                      ).url
                            }
                            title="Delete this transaction?"
                            description="This transaction will be moved to trash."
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="GCash" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="GCash & Load"
                        description="Track Mobile Load, GCash Cash In, and Cash Out"
                    />
                    {canCreate && (
                        <div className="flex flex-wrap gap-2">
                            <LoadTransactionDialog networks={networks} />
                            <GcashTransactionDialog />
                        </div>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Mobile Load (today)"
                        value={`₱${summary.load.amount}`}
                        caption={`${summary.load.count} transactions · ₱${summary.load.fees} fees`}
                        icon={SmartphoneIcon}
                    />
                    <StatCard
                        title="GCash Cash In (today)"
                        value={`₱${summary.cashIn.amount}`}
                        caption={`${summary.cashIn.count} transactions · ₱${summary.cashIn.fees} fees`}
                        icon={WalletIcon}
                    />
                    <StatCard
                        title="GCash Cash Out (today)"
                        value={`₱${summary.cashOut.amount}`}
                        caption={`${summary.cashOut.count} transactions · ₱${summary.cashOut.fees} fees`}
                        icon={WalletIcon}
                    />
                    <StatCard
                        title="Cash on Hand (today)"
                        value={`₱${summary.cashOnHand}`}
                        caption="Net change from today's transactions"
                        icon={BanknoteIcon}
                    />
                    <StatCard
                        title="GCash Balance (today)"
                        value={`₱${summary.gcashBalance}`}
                        caption="Net change from today's transactions"
                        icon={WalletIcon}
                    />
                </div>

                {rows.length === 0 ? (
                    <EmptyState
                        icon={WalletIcon}
                        title="No transactions yet"
                        description="Record your first Mobile Load or GCash transaction to get started."
                    />
                ) : (
                    <DataTable
                        data={rows}
                        columns={columns}
                        renderMobileCard={(row) => (
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">
                                        {row.label} · ₱{row.amount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {row.user} ·{' '}
                                        {new Date(
                                            row.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {canUpdate &&
                                        (row.kind === 'load' ? (
                                            <LoadTransactionDialog
                                                networks={networks}
                                                transaction={{
                                                    id: row.recordId,
                                                    network: row.network!,
                                                    amount: row.amount,
                                                    reference_number:
                                                        row.reference_number,
                                                    notes: row.notes,
                                                }}
                                            />
                                        ) : (
                                            <GcashTransactionDialog
                                                transaction={{
                                                    id: row.recordId,
                                                    type: row.type!,
                                                    amount: row.amount,
                                                    reference_number:
                                                        row.reference_number,
                                                    notes: row.notes,
                                                }}
                                            />
                                        ))}
                                    {canDelete && (
                                        <DeleteConfirmDialog
                                            url={
                                                row.kind === 'load'
                                                    ? LoadTransactionController.destroy(
                                                          row.recordId,
                                                      ).url
                                                    : GcashTransactionController.destroy(
                                                          row.recordId,
                                                      ).url
                                            }
                                            title="Delete this transaction?"
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

GcashIndex.layout = {
    breadcrumbs: [{ title: 'GCash', href: index() }],
};
