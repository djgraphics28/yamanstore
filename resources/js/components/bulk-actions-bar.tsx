import { BulkDeleteDialog } from '@/components/bulk-delete-dialog';
import { Button } from '@/components/ui/button';

export function BulkActionsBar({
    ids,
    deleteUrl,
    label,
    onClear,
    onDeleted,
}: {
    ids: (number | string)[];
    deleteUrl: string;
    label: string;
    onClear: () => void;
    onDeleted: () => void;
}) {
    if (ids.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
            <p className="text-sm text-muted-foreground">
                {ids.length} selected
            </p>
            <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                    Clear
                </Button>
                <BulkDeleteDialog
                    url={deleteUrl}
                    ids={ids}
                    label={label}
                    onDeleted={onDeleted}
                />
            </div>
        </div>
    );
}
