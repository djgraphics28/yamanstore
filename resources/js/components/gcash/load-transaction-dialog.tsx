import { Form } from '@inertiajs/react';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import LoadTransactionController from '@/actions/App/Http/Controllers/LoadTransactionController';
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
import { feeFor, maxAmount, minAmount  } from '@/lib/gcash-fees';
import type {FeeBracket} from '@/lib/gcash-fees';
import type { LoadNetwork } from '@/types';

type EditableLoadTransaction = {
    id: number;
    network: LoadNetwork;
    amount: number;
    reference_number: string | null;
    notes: string | null;
};

export function LoadTransactionDialog({
    brackets,
    networks,
    transaction,
}: {
    brackets: FeeBracket[];
    networks: { value: string; label: string }[];
    transaction?: EditableLoadTransaction;
}) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(
        transaction ? String(transaction.amount) : '',
    );

    const loadMin = minAmount(brackets);
    const loadMax = maxAmount(brackets);
    const fee = amount ? feeFor(brackets, Number(amount)) : null;

    const routeDef = transaction
        ? LoadTransactionController.update(transaction.id)
        : LoadTransactionController.store();

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
                        Add Mobile Load
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {transaction ? 'Edit Mobile Load' : 'Add Mobile Load'}
                </DialogTitle>

                <Form
                    action={routeDef}
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
                                <Label htmlFor="network">Network</Label>
                                <Select
                                    name="network"
                                    defaultValue={transaction?.network}
                                >
                                    <SelectTrigger id="network">
                                        <SelectValue placeholder="Select network" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {networks.map((network) => (
                                            <SelectItem
                                                key={network.value}
                                                value={network.value}
                                            >
                                                {network.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.network} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="amount">
                                    Amount (₱{loadMin}–₱{loadMax})
                                </Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min={loadMin}
                                    max={loadMax}
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
                                        : 'Record load'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
