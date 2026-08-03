import { Form } from '@inertiajs/react';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import GcashTransactionController from '@/actions/App/Http/Controllers/GcashTransactionController';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { gcashFeeFor, GCASH_MAX_AMOUNT, GCASH_MIN_AMOUNT } from '@/lib/gcash-fees';
import type { GcashTransactionType } from '@/types';

type EditableGcashTransaction = {
    id: number;
    type: GcashTransactionType;
    amount: number;
    reference_number: string | null;
    notes: string | null;
};

export function GcashTransactionDialog({
    transaction,
}: {
    transaction?: EditableGcashTransaction;
}) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(
        transaction ? String(transaction.amount) : '',
    );

    const fee = amount ? gcashFeeFor(Number(amount)) : null;

    const form = transaction
        ? GcashTransactionController.update.form(transaction.id)
        : GcashTransactionController.store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {transaction ? (
                    <Button variant="ghost" size="icon">
                        <PencilIcon className="size-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                ) : (
                    <Button variant="outline">
                        <PlusIcon className="size-4" />
                        Add GCash transaction
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {transaction
                        ? 'Edit GCash Transaction'
                        : 'Add GCash Transaction'}
                </DialogTitle>

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    onSuccess={() => {
                        setOpen(false);

                        if (!transaction) {
                            setAmount('');
                        }
                    }}
                    resetOnSuccess={!transaction}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    name="type"
                                    defaultValue={transaction?.type}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash_in">
                                            Cash In
                                        </SelectItem>
                                        <SelectItem value="cash_out">
                                            Cash Out
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="amount">
                                    Amount (₱{GCASH_MIN_AMOUNT}–₱
                                    {GCASH_MAX_AMOUNT})
                                </Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min={GCASH_MIN_AMOUNT}
                                    max={GCASH_MAX_AMOUNT}
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                {fee !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        Service fee: ₱{fee}
                                    </p>
                                )}
                                <InputError message={errors.amount} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reference_number">
                                    Reference number{' '}
                                    <span className="text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="reference_number"
                                    name="reference_number"
                                    defaultValue={
                                        transaction?.reference_number ?? ''
                                    }
                                />
                                <InputError
                                    message={errors.reference_number}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">
                                    Notes{' '}
                                    <span className="text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    defaultValue={transaction?.notes ?? ''}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button disabled={processing}>
                                    {transaction
                                        ? 'Save changes'
                                        : 'Record transaction'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
