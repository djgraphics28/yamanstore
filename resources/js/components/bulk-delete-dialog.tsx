import { router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function BulkDeleteDialog({
    url,
    ids,
    label = 'item',
    onDeleted,
}: {
    url: string;
    ids: (number | string)[];
    label?: string;
    onDeleted?: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    if (ids.length === 0) {
        return null;
    }

    const handleDelete = () => {
        setProcessing(true);
        router.delete(url, {
            data: { ids },
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                onDeleted?.();
            },
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                    <Trash2Icon className="size-4" />
                    Delete {ids.length} selected
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete {ids.length} {label}
                        {ids.length === 1 ? '' : 's'}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will move {ids.length} {label}
                        {ids.length === 1 ? '' : 's'} to trash. This cannot be
                        undone from here.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={processing}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
