import { MinusIcon, PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CartItem } from '@/types';

export function CartItemRow({
    item,
    maxStock,
    onUpdateQty,
    onRemove,
    onDiscountChange,
}: {
    item: CartItem;
    maxStock: number;
    onUpdateQty: (productId: number, qty: number) => void;
    onRemove: (productId: number) => void;
    onDiscountChange: (productId: number, discount: number) => void;
}) {
    const itemSubtotal = item.unit_price * item.quantity - item.discount;

    return (
        <div className="flex flex-col gap-1.5 px-3 py-2">
            {/* Top row: name + remove */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">{item.sku}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(item.product_id)}
                >
                    <XIcon className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Middle row: qty stepper + unit price + subtotal */}
            <div className="flex items-center gap-2">
                {/* Qty stepper */}
                <div className="flex items-center rounded-md border">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-r-none"
                        onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
                    >
                        <MinusIcon className="h-3 w-3" />
                    </Button>
                    <Input
                        type="number"
                        min={1}
                        max={maxStock}
                        value={item.quantity}
                        onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v)) onUpdateQty(item.product_id, v);
                        }}
                        className="h-7 w-12 rounded-none border-x border-y-0 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-l-none"
                        onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= maxStock}
                    >
                        <PlusIcon className="h-3 w-3" />
                    </Button>
                </div>

                <span className="text-xs text-muted-foreground">
                    ₱{item.unit_price.toFixed(2)}
                </span>

                <span className="ml-auto text-sm font-semibold">
                    ₱{itemSubtotal.toFixed(2)}
                </span>
            </div>

            {/* Discount row */}
            <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Item disc.</span>
                <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.discount === 0 ? '' : item.discount}
                    placeholder="0"
                    onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        onDiscountChange(item.product_id, isNaN(v) ? 0 : Math.max(0, v));
                    }}
                    className="h-6 w-24 text-xs"
                />
            </div>
        </div>
    );
}
