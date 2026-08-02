import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '@/components/dashboard/chart-colors';
import { EmptyState } from '@/components/empty-state';

export function CategoryDistributionChart({
    data,
}: {
    data: { name: string; value: number }[];
}) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={PieChartIcon}
                title="No products yet"
                description="Add products to categories to see the distribution here."
            />
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    isAnimationActive={false}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={entry.name}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--popover)',
                        color: 'var(--popover-foreground)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
