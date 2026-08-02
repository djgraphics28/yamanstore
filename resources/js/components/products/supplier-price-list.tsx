import { StarIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import {
    
    EntityCombobox
} from '@/components/entity-combobox';
import type {ComboboxOption} from '@/components/entity-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type SupplierPriceRow = {
    key: string;
    supplier_id: number | null;
    cost_price: string;
    is_preferred: boolean;
};

let keySequence = 0;

function makeKey(): string {
    keySequence += 1;

    return `supplier-price-${keySequence}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function SupplierPriceList({
    suppliers,
    initialRows = [],
}: {
    suppliers: ComboboxOption[];
    initialRows?: Omit<SupplierPriceRow, 'key'>[];
}) {
    const [rows, setRows] = useState<SupplierPriceRow[]>(() =>
        initialRows.length > 0
            ? initialRows.map((row) => ({ ...row, key: makeKey() }))
            : [],
    );

    const addRow = () => {
        setRows((current) => [
            ...current,
            {
                key: makeKey(),
                supplier_id: null,
                cost_price: '',
                is_preferred: current.length === 0,
            },
        ]);
    };

    const removeRow = (key: string) => {
        setRows((current) => {
            const next = current.filter((row) => row.key !== key);

            if (next.length > 0 && !next.some((row) => row.is_preferred)) {
                next[0] = { ...next[0], is_preferred: true };
            }

            return next;
        });
    };

    const updateRow = (key: string, changes: Partial<SupplierPriceRow>) => {
        setRows((current) =>
            current.map((row) =>
                row.key === key ? { ...row, ...changes } : row,
            ),
        );
    };

    const setPreferred = (key: string) => {
        setRows((current) =>
            current.map((row) => ({ ...row, is_preferred: row.key === key })),
        );
    };

    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between">
                <Label>Supplier cost prices</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    + Add supplier price
                </Button>
            </div>

            {rows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No suppliers added yet. Cost price will be ₱0.00 until you
                    add one.
                </p>
            )}

            <div className="flex flex-col gap-3">
                {rows.map((row, index) => {
                    const usedElsewhere = rows
                        .filter((other) => other.key !== row.key)
                        .map((other) => other.supplier_id);
                    const options = suppliers.filter(
                        (supplier) =>
                            !usedElsewhere.includes(supplier.id) ||
                            supplier.id === row.supplier_id,
                    );

                    return (
                        <div
                            key={row.key}
                            className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
                        >
                            <div className="flex-1">
                                <EntityCombobox
                                    name={`supplier_prices[${index}][supplier_id]`}
                                    options={options}
                                    value={row.supplier_id}
                                    onChange={(value) =>
                                        updateRow(row.key, {
                                            supplier_id: value,
                                        })
                                    }
                                    placeholder="Select supplier"
                                    searchPlaceholder="Search suppliers…"
                                />
                            </div>

                            <div className="w-full sm:w-36">
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Cost price"
                                    value={row.cost_price}
                                    onChange={(event) =>
                                        updateRow(row.key, {
                                            cost_price: event.target.value,
                                        })
                                    }
                                    name={`supplier_prices[${index}][cost_price]`}
                                />
                            </div>

                            <input
                                type="hidden"
                                name={`supplier_prices[${index}][is_preferred]`}
                                value={row.is_preferred ? '1' : '0'}
                            />

                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPreferred(row.key)}
                                    className={cn(
                                        'gap-1.5',
                                        row.is_preferred &&
                                            'text-primary hover:text-primary',
                                    )}
                                >
                                    <StarIcon
                                        className={cn(
                                            'size-4',
                                            row.is_preferred &&
                                                'fill-primary',
                                        )}
                                    />
                                    Preferred
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRow(row.key)}
                                >
                                    <Trash2Icon className="size-4 text-destructive" />
                                    <span className="sr-only">Remove</span>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
