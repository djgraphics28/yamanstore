import { Head } from '@inertiajs/react';
import {
    AlertTriangleIcon,
    BanknoteIcon,
    CalendarDaysIcon,
    CalendarIcon,
    CalendarRangeIcon,
    PackageXIcon,
    ReceiptText,
    TagsIcon,
    TrendingDownIcon,
    TrendingUpIcon,
} from 'lucide-react';
import { BestSellingChart } from '@/components/dashboard/best-selling-chart';
import { CategoryDistributionChart } from '@/components/dashboard/category-distribution-chart';
import { RecentTransactionsTable } from '@/components/dashboard/recent-transactions-table';
import { SalesTrendChart } from '@/components/dashboard/sales-trend-chart';
import Heading from '@/components/heading';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';
import { dashboard } from '@/routes';

type DashboardStats = {
    lowStockCount: number;
    outOfStockCount: number;
    totalProducts: number;
    totalCategories: number;
};

export default function Dashboard({
    stats,
    categoryDistribution,
}: {
    stats: DashboardStats;
    categoryDistribution: { name: string; value: number }[];
}) {
    const isLoading = useNavigationLoading();

    if (isLoading) {
        return (
            <div className="space-y-6 p-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Skeleton key={index} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-72" />
            </div>
        );
    }

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Dashboard"
                    description="Your store's performance at a glance"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Sales Today"
                        icon={CalendarIcon}
                        isEmpty
                        emptyCaption="Available once POS is live"
                    />
                    <StatCard
                        title="Sales This Week"
                        icon={CalendarDaysIcon}
                        isEmpty
                        emptyCaption="Available once POS is live"
                    />
                    <StatCard
                        title="Sales This Month"
                        icon={CalendarRangeIcon}
                        isEmpty
                        emptyCaption="Available once POS is live"
                    />
                    <StatCard
                        title="Monthly Income"
                        icon={BanknoteIcon}
                        isEmpty
                        emptyCaption="Available once POS is live"
                    />
                    <StatCard
                        title="Expenses"
                        icon={TrendingDownIcon}
                        isEmpty
                        emptyCaption="Available once expenses module is live"
                    />
                    <StatCard
                        title="Net Profit"
                        icon={TrendingUpIcon}
                        isEmpty
                        emptyCaption="Available once POS is live"
                    />
                    <StatCard
                        title="Low Stock Products"
                        icon={AlertTriangleIcon}
                        value={stats.lowStockCount}
                        caption="At or below minimum stock"
                    />
                    <StatCard
                        title="Out of Stock"
                        icon={PackageXIcon}
                        value={stats.outOfStockCount}
                        caption="Needs immediate restock"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Best Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BestSellingChart data={[]} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Category Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CategoryDistributionChart
                                data={categoryDistribution}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SalesTrendChart data={[]} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ReceiptText className="size-4" />
                            Recent Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentTransactionsTable transactions={[]} />
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Total Products"
                        icon={TagsIcon}
                        value={stats.totalProducts}
                    />
                    <StatCard
                        title="Total Categories"
                        icon={TagsIcon}
                        value={stats.totalCategories}
                    />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
