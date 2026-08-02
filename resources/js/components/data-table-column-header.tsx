import type { Column } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: {
    column: Column<TData, TValue>;
    title: string;
    className?: string;
}) {
    if (!column.getCanSort()) {
        return <span className={className}>{title}</span>;
    }

    const sorted = column.getIsSorted();

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('-ml-3 h-8 gap-1.5', className)}
            onClick={() => column.toggleSorting(sorted === 'asc')}
        >
            {title}
            {sorted === 'asc' ? (
                <ArrowUpIcon className="size-3.5" />
            ) : sorted === 'desc' ? (
                <ArrowDownIcon className="size-3.5" />
            ) : (
                <ChevronsUpDownIcon className="size-3.5 opacity-50" />
            )}
        </Button>
    );
}
