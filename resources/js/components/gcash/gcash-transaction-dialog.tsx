import { Form } from '@inertiajs/react';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import GcashTransactionController from '@/actions/App/Http/Controllers/GcashTransactionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { feeFor, maxAmount, minAmount  } from '@/lib/gcash-fees';
import type {FeeBracket} from '@/lib/gcash-fees';
import type { GcashTransactionType } from '@/types';

type EditableGcashTransaction = {
    id: number;
    type: GcashTransactionType;
    amount: number;
    fee_in_gcash: boolean;
    reference_number: string | null;
    notes: string | null;
};

export function GcashTransactionDialog({
    brackets,
    transaction,
}: {
    brackets: FeeBracket[];
    transaction?: EditableGcashTransaction;
}) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(
        transaction ? String(transaction.amount) : '',
    );
    const [type, setType] = useState<GcashTransactionType | ''>(
        transaction?.type ?? '',
    );
    const [feeInGcash, setFeeInGcash] = useState(
        transaction?.fee_in_gcash ?? false,
    );

    const gcashMin = minAmount(brackets);
    const gcashMax = maxAmount(brackets);
    const fee = amount ? feeFor(brackets, Number(amount)) : null;
    const isCashOut = type === 'cash_out';

    const routeDef = transaction
        ? GcashTransactionController.update(transaction.id)
        : GcashTransactionController.store();

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
                    action={routeDef}
                    options={{ preserveScroll: true }}
                    onSuccess={() => {
                        setOpen(false);

                        if (!transaction) {
                            setAmount('');
                            setType('');
                            setFeeInGcash(false);
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
                                    onValueChange={(v) =>
                                        setType(v as GcashTransactionType)
                                    }
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
                                    Amount (₱{gcashMin}–₱{gcashMax})
                                </Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min={gcashMin}
                                    max={gcashMax}
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
                                        {isCashOut && feeInGcash
                                            ? ' (included in GCash transfer)'
                                            : ''}
                                    </p>
                                )}
                                <InputError message={errors.amount} />
                            </div>

                            {isCashOut && (
                                <div className="flex items-start gap-3 rounded-md border p-3">
                                    <Checkbox
                                        id="fee_in_gcash"
                                        name="fee_in_gcash"
                                        checked={feeInGcash}
                                        onCheckedChange={(checked) =>
                                            setFeeInGcash(checked === true)
                                        }
                                        value="1"
                                    />
                                    <div className="grid gap-1">
                                        <Label
                                            htmlFor="fee_in_gcash"
                                            className="cursor-pointer"
                                        >
                                            Fee included in GCash transfer
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Customer sent the cash-out amount
                                            plus the service fee via GCash.
                                            {fee !== null && feeInGcash && (
                                                <span>
                                                    {' '}
                                                    GCash received: ₱
                                                    {Number(amount) + fee}.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <InputError message={errors.fee_in_gcash} />
                                </div>
                            )}

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
