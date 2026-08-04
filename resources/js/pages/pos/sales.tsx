import { Head, router } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    BanknoteIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ReceiptIcon,
    ShoppingBagIcon,
    XCircleIcon,
} from 'lucide-react';
import { useState } from 'react';
import SaleController from '@/actions/App/Http/Controllers/SaleController';
import Heading from '@/components/heading';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import { index as posIndex } from '@/routes/pos';
import { index as salesIndex } from '@/routes/pos/sales';
import type { Paginated, Sale } from '@/types';

type Stats = {
    total_sales: number;
    total_revenue: number;
    total_voided: number;
};

type PageProps = {
    sales: Paginated<Sale>;
    stats: Stats;
    dateFrom: string;
    dateTo: string;
};

function VoidDialog({ sale, onClose }: { sale: Sale; onClose: () => void }) {
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleVoid = () => {
        if (!reason.trim() || processing) return;
        setProcessing(true);
        router.post(
            SaleController.void(sale.id).url,
            { void_reason: reason },
            {
                onFinish: () => {
                    setProcessing(false);
                    onClose();
                },
                preserveScroll: true,
            },
        );
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-sm">
                <DialogTitle>Void Sale {sale.reference_number}</DialogTitle>
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Total: <span className="font-semibold text-foreground">₱{sale.total.toFixed(2)}</span>.
                        This will reverse stock for all items. This action cannot be undone.
                    </p>
                    <div className="space-y-1">
                        <Label htmlFor="void-reason">Void Reason *</Label>
                        <Textarea
                            id="void-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for voiding this sale..."
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleVoid}
                        disabled={!reason.trim() || processing}
                    >
                        {processing ? 'Voiding...' : 'Void Sale'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SaleRowExpanded({ sale }: { sale: Sale }) {
    return (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell colSpan={8} className="px-6 py-3">
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Items
                    </p>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-left text-muted-foreground">
                                <th className="pb-1 font-medium">Product</th>
                                <th className="pb-1 font-medium">SKU</th>
                                <th className="pb-1 text-right font-medium">Price</th>
                                <th className="pb-1 text-right font-medium">Qty</th>
                                <th className="pb-1 text-right font-medium">Disc.</th>
                                <th className="pb-1 text-right font-medium">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {sale.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-1 pr-2">{item.product_name}</td>
                                    <td className="py-1 pr-2 text-muted-foreground">
                                        {item.product_sku}
                                    </td>
                                    <td className="py-1 text-right">
                                        ₱{item.unit_price.toFixed(2)}
                                    </td>
                                    <td className="py-1 text-right">{item.quantity}</td>
                                    <td className="py-1 text-right">
                                        {item.discount > 0
                                            ? `-₱${item.discount.toFixed(2)}`
                                            : '—'}
                                    </td>
                                    <td className="py-1 text-right font-medium">
                                        ₱{item.subtotal.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sale.void_reason && (
                        <p className="text-xs text-destructive">
                            Void reason: {sale.void_reason}
                            {sale.voided_by && ` (by ${sale.voided_by})`}
                        </p>
                    )}
                    {sale.notes && (
                        <p className="text-xs text-muted-foreground">Notes: {sale.notes}</p>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}

export default function SalesHistory({ sales, stats, dateFrom, dateTo }: PageProps) {
    const canVoid = usePermission('pos.void');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [voidingSale, setVoidingSale] = useState<Sale | null>(null);

    const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
        router.get(
            salesIndex().url,
            { date_from: field === 'date_from' ? value : dateFrom, date_to: field === 'date_to' ? value : dateTo },
            { preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Sales History" />

            {voidingSale && (
                <VoidDialog sale={voidingSale} onClose={() => setVoidingSale(null)} />
            )}

            <div className="space-y-6 p-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Sales History"
                        description="View and manage completed sales"
                    />

                    {/* Date range filter */}
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateChange('date_from', e.target.value)}
                            className="h-9 w-36 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => handleDateChange('date_to', e.target.value)}
                            className="h-9 w-36 text-sm"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Completed Sales"
                        value={stats.total_sales}
                        icon={ShoppingBagIcon}
                        caption="for selected period"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₱${stats.total_revenue.toFixed(2)}`}
                        icon={BanknoteIcon}
                        caption="from completed sales"
                    />
                    <StatCard
                        title="Voided Sales"
                        value={stats.total_voided}
                        icon={XCircleIcon}
                        caption="for selected period"
                    />
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8" />
                                <TableHead>Reference</TableHead>
                                <TableHead>Cashier</TableHead>
                                <TableHead className="text-right">Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Time</TableHead>
                                {canVoid && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={canVoid ? 9 : 8}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        <ReceiptIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                        <p>No sales for this period</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sales.data.map((sale) => (
                                    <Fragment key={sale.id}>
                                        <TableRow
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setExpandedId(
                                                    expandedId === sale.id ? null : sale.id,
                                                )
                                            }
                                        >
                                            <TableCell className="text-muted-foreground">
                                                {expandedId === sale.id ? (
                                                    <ChevronUpIcon className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs font-medium">
                                                {sale.reference_number}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {sale.cashier}
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                {sale.items.length}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-semibold">
                                                ₱{sale.total.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs uppercase">
                                                    {sale.payment_method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {sale.status === 'completed' ? (
                                                    <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs">
                                                        Completed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Voided
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(sale.created_at).toLocaleTimeString()}
                                            </TableCell>
                                            {canVoid && (
                                                <TableCell
                                                    className="text-right"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {sale.status === 'completed' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs text-destructive hover:text-destructive"
                                                            onClick={() => setVoidingSale(sale)}
                                                        >
                                                            Void
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                        {expandedId === sale.id && (
                                            <SaleRowExpanded sale={sale} />
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {sales.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {sales.from}–{sales.to} of {sales.total}
                        </span>
                        <div className="flex gap-2">
                            {sales.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) router.visit(link.url, { preserveScroll: true });
                                    }}
                                    className={`rounded border px-2 py-1 text-xs transition-colors ${
                                        link.active
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : link.url
                                              ? 'hover:bg-accent'
                                              : 'cursor-not-allowed opacity-40'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

SalesHistory.layout = {
    breadcrumbs: [
        { title: 'POS', href: posIndex() },
        { title: 'Sales History', href: salesIndex().url },
    ],
};
