import { useForm } from '@inertiajs/react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import GcashBalanceController from '@/actions/App/Http/Controllers/GcashBalanceController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type OpeningBalance = {
    id: number;
    date: string;
    cash_on_hand: number;
    gcash_balance: number;
    notes: string | null;
};

export function GcashBalanceDialog({
    date,
    openingBalance,
}: {
    date: string;
    openingBalance?: OpeningBalance | null;
}) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        date,
        cash_on_hand: String(openingBalance?.cash_on_hand ?? 0),
        gcash_balance: String(openingBalance?.gcash_balance ?? 0),
        notes: openingBalance?.notes ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(GcashBalanceController.store().url, {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!openingBalance) return;
        destroy(GcashBalanceController.destroy(openingBalance.id).url, {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    {openingBalance ? (
                        <PencilIcon className="size-4" />
                    ) : (
                        <PlusIcon className="size-4" />
                    )}
                    {openingBalance ? 'Edit' : 'Set'} Opening Balance
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>
                    {openingBalance ? 'Edit' : 'Set'} Opening Balance — {date}
                </DialogTitle>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="date" value={data.date} />

                    <div className="space-y-1.5">
                        <Label htmlFor="cash_on_hand">Cash on Hand (₱)</Label>
                        <Input
                            id="cash_on_hand"
                            type="number"
                            min="0"
                            value={data.cash_on_hand}
                            onChange={(e) => setData('cash_on_hand', e.target.value)}
                        />
                        <InputError message={errors.cash_on_hand} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="gcash_balance">GCash Balance (₱)</Label>
                        <Input
                            id="gcash_balance"
                            type="number"
                            min="0"
                            value={data.gcash_balance}
                            onChange={(e) => setData('gcash_balance', e.target.value)}
                        />
                        <InputError message={errors.gcash_balance} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="balance_notes">Notes</Label>
                        <Textarea
                            id="balance_notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={2}
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <DialogFooter className="gap-2">
                        {openingBalance && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={processing}
                                onClick={handleDelete}
                            >
                                <Trash2Icon className="size-4" />
                                Reset
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
