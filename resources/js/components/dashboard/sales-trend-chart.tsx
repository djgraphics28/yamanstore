import { TrendingUp } from 'lucide-react';
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { EmptyState } from '@/components/empty-state';

export function SalesTrendChart({
    data,
}: {
    data: { date: string; total: number }[];
}) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={TrendingUp}
                title="No sales recorded yet"
                description="Sales trends will appear here once the POS is in use."
            />
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="salesTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.4}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--popover)',
                        color: 'var(--popover-foreground)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--chart-1)"
                    fill="url(#salesTrend)"
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
