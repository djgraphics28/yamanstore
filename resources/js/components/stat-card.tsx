import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
    title,
    value,
    icon: Icon,
    caption,
    isEmpty = false,
    emptyCaption,
    className,
}: {
    title: string;
    value?: string | number;
    icon?: LucideIcon;
    caption?: string;
    isEmpty?: boolean;
    emptyCaption?: string;
    className?: string;
}) {
    return (
        <Card className={cn(className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {Icon && <Icon className="size-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                {isEmpty ? (
                    <>
                        <p className="text-2xl font-semibold text-muted-foreground">
                            —
                        </p>
                        {emptyCaption && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {emptyCaption}
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-2xl font-semibold">{value}</p>
                        {caption && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {caption}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
