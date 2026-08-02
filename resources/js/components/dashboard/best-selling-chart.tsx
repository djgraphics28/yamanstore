import { BarChart3 } from 'lucide-react';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { EmptyState } from '@/components/empty-state';

export function BestSellingChart({
    data,
}: {
    data: { name: string; quantity: number }[];
}) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={BarChart3}
                title="No sales recorded yet"
                description="Your top-selling products will show up here once the POS is in use."
            />
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--popover)',
                        color: 'var(--popover-foreground)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
                <Bar
                    dataKey="quantity"
                    fill="var(--chart-2)"
                    radius={4}
                    isAnimationActive={false}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
