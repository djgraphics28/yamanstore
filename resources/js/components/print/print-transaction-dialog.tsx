import { Form } from '@inertiajs/react';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import PrintTransactionController from '@/actions/App/Http/Controllers/PrintTransactionController';
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
import { priceFor, sizesFor } from '@/lib/print-prices';
import type { PrintPaperSize, PrintServiceOption, PrintServiceType } from '@/types';

type EditablePrintTransaction = {
    id: number;
    service_type: PrintServiceType;
    paper_size: PrintPaperSize;
    pages: number;
    notes: string | null;
};

export function PrintTransactionDialog({
    serviceTypes,
    transaction,
}: {
    serviceTypes: PrintServiceOption[];
    transaction?: EditablePrintTransaction;
}) {
    const [open, setOpen] = useState(false);
    const [serviceType, setServiceType] = useState<PrintServiceType | ''>(
        transaction?.service_type ?? '',
    );
    const [paperSize, setPaperSize] = useState<PrintPaperSize | ''>(
        transaction?.paper_size ?? '',
    );
    const [pages, setPages] = useState(transaction ? String(transaction.pages) : '');

    const unitPrice =
        serviceType && paperSize ? priceFor(serviceType, paperSize) : null;
    const total =
        unitPrice !== null && pages ? unitPrice * Number(pages) : null;

    const sizeOptions = serviceType
        ? (serviceTypes.find((s) => s.value === serviceType)?.sizes ?? [])
        : [];

    const routeDef = transaction
        ? PrintTransactionController.update(transaction.id)
        : PrintTransactionController.store();

    function handleServiceTypeChange(value: string) {
        setServiceType(value as PrintServiceType);
        // Reset paper size if it's not valid for the new service type
        const validSizes = sizesFor(value as PrintServiceType);

        if (paperSize && !validSizes.includes(paperSize)) {
            setPaperSize('');
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {transaction ? (
                    <Button variant="ghost" size="icon">
                        <PencilIcon className="size-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                ) : (
                    <Button>
                        <PlusIcon className="size-4" />
                        Add print job
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {transaction ? 'Edit Print Job' : 'Add Print Job'}
                </DialogTitle>

                <Form
                    action={routeDef}
                    options={{ preserveScroll: true }}
                    onSuccess={() => {
                        setOpen(false);

                        if (!transaction) {
                            setServiceType('');
                            setPaperSize('');
                            setPages('');
                        }
                    }}
                    resetOnSuccess={!transaction}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="service_type">Service</Label>
                                <Select
                                    name="service_type"
                                    defaultValue={transaction?.service_type}
                                    onValueChange={handleServiceTypeChange}
                                >
                                    <SelectTrigger id="service_type">
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {serviceTypes.map((s) => (
                                            <SelectItem
                                                key={s.value}
                                                value={s.value}
                                            >
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.service_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="paper_size">Paper size</Label>
                                <Select
                                    name="paper_size"
                                    value={paperSize}
                                    onValueChange={(v) =>
                                        setPaperSize(v as PrintPaperSize)
                                    }
                                    disabled={!serviceType}
                                >
                                    <SelectTrigger id="paper_size">
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizeOptions.map((s) => (
                                            <SelectItem
                                                key={s.value}
                                                value={s.value}
                                            >
                                                {s.label} — ₱{s.price}/page
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.paper_size} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pages">
                                    Number of pages
                                </Label>
                                <Input
                                    id="pages"
                                    name="pages"
                                    type="number"
                                    min={1}
                                    max={9999}
                                    value={pages}
                                    onChange={(e) => setPages(e.target.value)}
                                    required
                                />
                                {total !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        Total: ₱{total}{' '}
                                        <span className="opacity-60">
                                            ({pages} × ₱{unitPrice})
                                        </span>
                                    </p>
                                )}
                                <InputError message={errors.pages} />
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
                                    rows={2}
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
                                        : 'Record job'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
