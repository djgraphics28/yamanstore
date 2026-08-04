import { Head, router } from '@inertiajs/react';
import { SearchIcon, ShoppingCartIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SaleController from '@/actions/App/Http/Controllers/SaleController';
import { CartItemRow } from '@/components/pos/cart-item-row';
import { ProductCard } from '@/components/pos/product-card';
import { ReceiptModal } from '@/components/pos/receipt-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { index as posIndex } from '@/routes/pos';
import type { CartItem, PosCategory, PosProduct, Sale } from '@/types';

type PageProps = {
    products: PosProduct[];
    categories: PosCategory[];
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export default function PosIndex({ products, categories }: PageProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [overallDiscount, setOverallDiscount] = useState('0');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
    const [amountTendered, setAmountTendered] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [completedSale, setCompletedSale] = useState<Sale | null>(null);

    const searchRef = useRef<HTMLInputElement>(null);

    // Show receipt when flash.sale arrives via Inertia flash event
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash as { sale?: Sale } | undefined;
            if (flash?.sale) {
                setCompletedSale(flash.sale);
            }
        });
    }, []);

    // F1 focuses search
    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, []);

    // Filtered products
    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.barcode ?? '').toLowerCase().includes(q);
        const matchCat = selectedCategoryId === null || p.category_id === selectedCategoryId;
        return matchSearch && matchCat;
    });

    // Cart helpers
    const addToCart = (product: PosProduct) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product_id === product.id
                        ? { ...i, quantity: Math.min(i.quantity + 1, product.current_stock) }
                        : i,
                );
            }
            return [
                ...prev,
                {
                    product_id: product.id,
                    name: product.name,
                    sku: product.sku,
                    unit_price: product.selling_price,
                    quantity: 1,
                    discount: 0,
                },
            ];
        });
    };

    const updateQty = (productId: number, qty: number) => {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        const product = products.find((p) => p.id === productId);
        const maxStock = product?.current_stock ?? qty;
        setCart((prev) =>
            prev.map((i) =>
                i.product_id === productId
                    ? { ...i, quantity: Math.min(qty, maxStock) }
                    : i,
            ),
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((i) => i.product_id !== productId));
    };

    const updateDiscount = (productId: number, discount: number) => {
        setCart((prev) =>
            prev.map((i) => (i.product_id === productId ? { ...i, discount } : i)),
        );
    };

    const clearCart = () => {
        setCart([]);
        setOverallDiscount('0');
        setAmountTendered('');
        setPaymentMethod('cash');
        setNotes('');
    };

    // Calculations
    const itemsSubtotal = cart.reduce(
        (s, i) => s + i.unit_price * i.quantity - i.discount,
        0,
    );
    const disc = Math.max(0, parseFloat(overallDiscount) || 0);
    const total = Math.max(0, itemsSubtotal - disc);
    const tendered = parseFloat(amountTendered) || 0;
    const changeDue = paymentMethod === 'cash' ? Math.max(0, tendered - total) : 0;
    const canCharge =
        cart.length > 0 && (paymentMethod === 'gcash' || tendered >= total);

    const handleCharge = () => {
        if (!canCharge || processing) return;
        setProcessing(true);
        router.post(
            SaleController.store().url,
            {
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    discount: i.discount,
                })),
                discount: parseFloat(overallDiscount) || 0,
                payment_method: paymentMethod,
                amount_tendered: tendered,
                notes,
            },
            {
                onFinish: () => setProcessing(false),
                preserveScroll: true,
            },
        );
    };

    const handleSearchKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filtered.length > 0) {
            addToCart(filtered[0]);
            setSearch('');
        }
    };

    const cartQtyMap = Object.fromEntries(cart.map((i) => [i.product_id, i.quantity]));

    return (
        <>
            <Head title="POS Terminal" />

            {completedSale && (
                <ReceiptModal
                    sale={completedSale}
                    onClose={() => {
                        setCompletedSale(null);
                        clearCart();
                    }}
                />
            )}

            <div className="flex h-[calc(100vh-57px)] overflow-hidden">
                {/* LEFT: Product browser */}
                <div className="flex flex-1 flex-col overflow-hidden border-r">
                    {/* Search */}
                    <div className="border-b bg-background p-3">
                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                placeholder="Search by name, SKU or scan barcode (F1)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKey}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex shrink-0 gap-2 overflow-x-auto border-b p-2">
                        <button
                            onClick={() => setSelectedCategoryId(null)}
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                selectedCategoryId === null
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-background hover:bg-accent'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() =>
                                    setSelectedCategoryId(
                                        selectedCategoryId === cat.id ? null : cat.id,
                                    )
                                }
                                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    selectedCategoryId === cat.id
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-background hover:bg-accent'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Product grid */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {filtered.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-sm text-muted-foreground">
                                <ShoppingCartIcon className="mb-2 h-8 w-8 opacity-30" />
                                <p>No products found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                                {filtered.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        inCart={cartQtyMap[p.id] ?? 0}
                                        onClick={addToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Cart */}
                <div className="flex w-[360px] shrink-0 flex-col bg-background xl:w-[420px]">
                    {/* Cart header */}
                    <div className="flex items-center justify-between border-b p-3">
                        <span className="text-sm font-semibold">
                            Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
                        </span>
                        {cart.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearCart}>
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Cart items */}
                    <div className="flex-1 divide-y overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                                <ShoppingCartIcon className="h-10 w-10 opacity-20" />
                                <p>Cart is empty</p>
                                <p className="text-xs">Click a product to add it</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <CartItemRow
                                    key={item.product_id}
                                    item={item}
                                    maxStock={
                                        products.find((p) => p.id === item.product_id)
                                            ?.current_stock ?? item.quantity
                                    }
                                    onUpdateQty={updateQty}
                                    onRemove={removeFromCart}
                                    onDiscountChange={updateDiscount}
                                />
                            ))
                        )}
                    </div>

                    {/* Payment panel */}
                    {cart.length > 0 && (
                        <div className="space-y-3 border-t bg-background p-4">
                            {/* Overall discount */}
                            <div className="flex items-center gap-2">
                                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                                    Order disc.
                                </span>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={overallDiscount}
                                    onChange={(e) => setOverallDiscount(e.target.value)}
                                    className="h-7 text-xs"
                                />
                            </div>

                            {/* Totals summary */}
                            <div className="space-y-0.5 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₱{itemsSubtotal.toFixed(2)}</span>
                                </div>
                                {disc > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Discount</span>
                                        <span>-₱{disc.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>₱{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment method */}
                            <div className="flex gap-2">
                                <Button
                                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    Cash
                                </Button>
                                <Button
                                    variant={paymentMethod === 'gcash' ? 'default' : 'outline'}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setPaymentMethod('gcash')}
                                >
                                    GCash
                                </Button>
                            </div>

                            {/* Cash: tendered + change */}
                            {paymentMethod === 'cash' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-24 shrink-0 text-xs text-muted-foreground">
                                            Tendered
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                            value={amountTendered}
                                            onChange={(e) => setAmountTendered(e.target.value)}
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    {/* Quick amounts */}
                                    <div className="flex flex-wrap gap-1">
                                        {QUICK_AMOUNTS.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() =>
                                                    setAmountTendered(amt.toString())
                                                }
                                                className="rounded border px-2 py-0.5 text-xs hover:bg-accent"
                                            >
                                                ₱{amt}
                                            </button>
                                        ))}
                                    </div>
                                    {tendered > 0 && (
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span>Change</span>
                                            <span
                                                className={
                                                    changeDue >= 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-destructive'
                                                }
                                            >
                                                ₱{changeDue.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            <Textarea
                                placeholder="Notes (optional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-0 resize-none text-xs"
                                rows={2}
                            />

                            {/* Charge button */}
                            <Button
                                className="h-12 w-full text-base font-bold"
                                disabled={!canCharge || processing}
                                onClick={handleCharge}
                            >
                                {processing
                                    ? 'Processing...'
                                    : `Charge ₱${total.toFixed(2)}`}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PosIndex.layout = {
    breadcrumbs: [{ title: 'POS', href: posIndex() }],
};
