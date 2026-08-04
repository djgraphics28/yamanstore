import { Head, router } from '@inertiajs/react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { edit, updateGcash, updateLoad } from '@/routes/fee-schedule';

type Bracket = { min_amount: number | ''; max_amount: number | ''; fee: number | '' };

function BracketTable({
    title,
    description,
    brackets,
    onSave,
    processing,
}: {
    title: string;
    description: string;
    brackets: Bracket[];
    onSave: (brackets: Bracket[]) => void;
    processing: boolean;
}) {
    const [rows, setRows] = useState<Bracket[]>(brackets);

    const update = (index: number, field: keyof Bracket, value: string) => {
        setRows((prev) =>
            prev.map((row, i) =>
                i === index
                    ? { ...row, [field]: value === '' ? '' : Number(value) }
                    : row,
            ),
        );
    };

    const addRow = () => {
        const last = rows[rows.length - 1];
        const nextMin = last && last.max_amount !== '' ? Number(last.max_amount) + 1 : 1;
        setRows((prev) => [...prev, { min_amount: nextMin, max_amount: '', fee: '' }]);
    };

    const removeRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
                <h2 className="font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40">
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                Min (₱)
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                Max (₱)
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                Fee (₱)
                            </th>
                            <th className="w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b last:border-0">
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={row.min_amount}
                                        onChange={(e) =>
                                            update(i, 'min_amount', e.target.value)
                                        }
                                        className="h-8 w-28"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={row.max_amount}
                                        onChange={(e) =>
                                            update(i, 'max_amount', e.target.value)
                                        }
                                        className="h-8 w-28"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        value={row.fee}
                                        onChange={(e) =>
                                            update(i, 'fee', e.target.value)
                                        }
                                        className="h-8 w-24"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => removeRow(i)}
                                        disabled={rows.length <= 1}
                                    >
                                        <Trash2Icon className="size-4 text-destructive" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3">
                <Button variant="outline" size="sm" type="button" onClick={addRow}>
                    <PlusIcon className="size-4" />
                    Add bracket
                </Button>
                <Button
                    size="sm"
                    disabled={processing}
                    onClick={() => onSave(rows)}
                >
                    Save changes
                </Button>
            </div>
        </div>
    );
}

export default function FeeSchedulePage({
    gcashBrackets,
    loadBrackets,
}: {
    gcashBrackets: Bracket[];
    loadBrackets: Bracket[];
}) {
    const [gcashProcessing, setGcashProcessing] = useState(false);
    const [loadProcessing, setLoadProcessing] = useState(false);

    const saveGcash = (rows: Bracket[]) => {
        setGcashProcessing(true);
        router.put(
            updateGcash().url,
            { brackets: rows },
            {
                onFinish: () => setGcashProcessing(false),
            },
        );
    };

    const saveLoad = (rows: Bracket[]) => {
        setLoadProcessing(true);
        router.put(
            updateLoad().url,
            { brackets: rows },
            {
                onFinish: () => setLoadProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="Fee Schedule" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Fee Schedule"
                    description="Configure GCash and Mobile Load service fee brackets"
                />

                <BracketTable
                    title="GCash Fees (Cash In & Cash Out)"
                    description="Fee charged per GCash transaction based on amount range"
                    brackets={gcashBrackets}
                    onSave={saveGcash}
                    processing={gcashProcessing}
                />

                <BracketTable
                    title="Mobile Load Fees"
                    description="Fee charged per load transaction based on amount range"
                    brackets={loadBrackets}
                    onSave={saveLoad}
                    processing={loadProcessing}
                />
            </div>
        </>
    );
}

FeeSchedulePage.layout = {
    breadcrumbs: [{ title: 'Fee Schedule', href: edit() }],
};
