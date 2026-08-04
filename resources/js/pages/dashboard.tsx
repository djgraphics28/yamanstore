import { Head, router } from '@inertiajs/react';
import {
    AlertTriangleIcon,
    BanknoteIcon,
    ChevronRightIcon,
    PackageIcon,
    PackageXIcon,
    PrinterIcon,
    ReceiptIcon,
    ShoppingCartIcon,
    SmartphoneIcon,
    TagsIcon,
    TrendingUpIcon,
    WalletIcon,
    XCircleIcon,
} from 'lucide-react';
import { CategoryDistributionChart } from '@/components/dashboard/category-distribution-chart';
import { SalesTrendChart } from '@/components/dashboard/sales-trend-chart';
import Heading from '@/components/heading';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import { index as salesIndex } from '@/routes/pos/sales';
import { index as gcashIndex } from '@/routes/gcash';
import { index as printIndex } from '@/routes/print';
import { Link } from '@inertiajs/react';

type GcashChannelStats = { amount: number; fees: number; count: number };

type PageProps = {
    pos: { revenue: number; count: number; voided: number };
    gcash: { cashIn: GcashChannelStats; cashOut: GcashChannelStats; load: GcashChannelStats };
    print: { revenue: number; count: number; pages: number };
    inventory: { lowStockCount: number; outOfStockCount: number; totalProducts: number; totalCategories: number };
    categoryDistribution: { name: string; value: number }[];
    salesTrend: { date: string; revenue: number; count: number }[];
    bestSelling: { name: string; qty: number; revenue: number }[];
    dateFrom: string;
    dateTo: string;
};

function fmt(n: number) {
    return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function periodLabel(dateFrom: string, dateTo: string): string {
    const today = new Date().toISOString().slice(0, 10);
    if (dateFrom === dateTo) return dateFrom === today ? 'Today' : dateFrom;
    return `${dateFrom} – ${dateTo}`;
}

function SectionHeader({ icon: Icon, title, href }: { icon: React.ElementType; title: string; href?: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
            </div>
            {href && (
                <Link href={href} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    View all <ChevronRightIcon className="h-3 w-3" />
                </Link>
            )}
        </div>
    );
}

export default function Dashboard({
    pos, gcash, print, inventory, categoryDistribution, salesTrend, bestSelling, dateFrom, dateTo,
}: PageProps) {
    const label = periodLabel(dateFrom, dateTo);

    const gcashTotalFees = gcash.cashIn.fees + gcash.cashOut.fees + gcash.load.fees;
    const gcashTotalTx   = gcash.cashIn.count + gcash.cashOut.count + gcash.load.count;

    const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
        router.get(
            dashboard().url,
            { date_from: field === 'date_from' ? value : dateFrom, date_to: field === 'date_to' ? value : dateTo },
            { preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-8 p-4">
                {/* Header + date filter */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Heading
                        title="Dashboard"
                        description="Store performance overview"
                    />
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

                {/* POS Sales */}
                <div className="space-y-3">
                    <SectionHeader icon={ShoppingCartIcon} title={`POS Sales — ${label}`} href={salesIndex().url} />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard
                            title="Revenue"
                            value={fmt(pos.revenue)}
                            icon={BanknoteIcon}
                            caption={`${pos.count} completed sales`}
                        />
                        <StatCard
                            title="Transactions"
                            value={String(pos.count)}
                            icon={ReceiptIcon}
                            caption="Completed sales"
                        />
                        <StatCard
                            title="Voided"
                            value={String(pos.voided)}
                            icon={XCircleIcon}
                            caption="Voided sales (not in revenue)"
                        />
                    </div>
                </div>

                {/* GCash */}
                <div className="space-y-3">
                    <SectionHeader icon={WalletIcon} title={`GCash & Load — ${label}`} href={gcashIndex().url} />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total GCash Fees"
                            value={fmt(gcashTotalFees)}
                            icon={TrendingUpIcon}
                            caption={`${gcashTotalTx} total transactions`}
                        />
                        <StatCard
                            title="Mobile Load"
                            value={fmt(gcash.load.amount)}
                            icon={SmartphoneIcon}
                            caption={`${gcash.load.count} tx · ${fmt(gcash.load.fees)} fees`}
                        />
                        <StatCard
                            title="GCash Cash In"
                            value={fmt(gcash.cashIn.amount)}
                            icon={WalletIcon}
                            caption={`${gcash.cashIn.count} tx · ${fmt(gcash.cashIn.fees)} fees`}
                        />
                        <StatCard
                            title="GCash Cash Out"
                            value={fmt(gcash.cashOut.amount)}
                            icon={WalletIcon}
                            caption={`${gcash.cashOut.count} tx · ${fmt(gcash.cashOut.fees)} fees`}
                        />
                    </div>
                </div>

                {/* Print */}
                <div className="space-y-3">
                    <SectionHeader icon={PrinterIcon} title={`Print / Scan / Copy — ${label}`} href={printIndex().url} />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard
                            title="Print Revenue"
                            value={fmt(print.revenue)}
                            icon={BanknoteIcon}
                            caption={`${print.count} jobs`}
                        />
                        <StatCard
                            title="Jobs"
                            value={String(print.count)}
                            icon={PrinterIcon}
                            caption="Print/scan/copy jobs"
                        />
                        <StatCard
                            title="Pages"
                            value={String(print.pages)}
                            icon={PrinterIcon}
                            caption="Total pages processed"
                        />
                    </div>
                </div>

                {/* Charts row */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Daily Sales Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SalesTrendChart data={salesTrend.map((d) => ({ date: d.date, total: d.revenue }))} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Category Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CategoryDistributionChart data={categoryDistribution} />
                        </CardContent>
                    </Card>
                </div>

                {/* Best selling + Inventory */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Best selling table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <TrendingUpIcon className="h-4 w-4" />
                                Best Selling Products — {label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bestSelling.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">No sales data for this period</p>
                            ) : (
                                <div className="space-y-0 divide-y">
                                    {bestSelling.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 text-xs font-semibold text-muted-foreground">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-right">
                                                <Badge variant="secondary" className="text-xs">
                                                    {item.qty} sold
                                                </Badge>
                                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                    {fmt(item.revenue)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Inventory summary */}
                    <div className="space-y-3">
                        <SectionHeader icon={PackageIcon} title="Inventory" />
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                title="Low Stock"
                                value={inventory.lowStockCount}
                                icon={AlertTriangleIcon}
                                caption="At or below minimum"
                            />
                            <StatCard
                                title="Out of Stock"
                                value={inventory.outOfStockCount}
                                icon={PackageXIcon}
                                caption="Needs restock"
                            />
                            <StatCard
                                title="Total Products"
                                value={inventory.totalProducts}
                                icon={PackageIcon}
                                caption="Active in catalog"
                            />
                            <StatCard
                                title="Categories"
                                value={inventory.totalCategories}
                                icon={TagsIcon}
                                caption="Product categories"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
