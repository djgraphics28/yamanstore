import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center',
                className,
            )}
        >
            {Icon && (
                <div className="mb-2 rounded-full bg-muted p-3">
                    <Icon className="size-6 text-muted-foreground" />
                </div>
            )}
            <p className="text-sm font-medium">{title}</p>
            {description && (
                <p className="max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
