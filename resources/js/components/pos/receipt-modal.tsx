import { PrinterIcon, ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Sale } from '@/types';

export function ReceiptModal({
    sale,
    onClose,
}: {
    sale: Sale;
    onClose: () => void;
}) {
    return (
        <>
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #receipt-print { display: block !important; }
                }
                #receipt-print { display: none; }
            `}</style>

            {/* Hidden print-only copy */}
            <div id="receipt-print">
                <ReceiptContent sale={sale} />
            </div>

            <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
                <DialogContent className="max-w-sm">
                    <DialogTitle className="sr-only">Receipt</DialogTitle>
                    <ReceiptContent sale={sale} />
                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.print()}
                        >
                            <PrinterIcon className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button className="flex-1" onClick={onClose}>
                            <ShoppingCartIcon className="mr-2 h-4 w-4" />
                            New Sale
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ReceiptContent({ sale }: { sale: Sale }) {
    return (
        <div className="space-y-3 font-mono text-sm">
            {/* Header */}
            <div className="text-center">
                <p className="text-base font-bold">YamanStore</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(sale.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                    Ref: {sale.reference_number}
                </p>
                <p className="text-xs text-muted-foreground">
                    Cashier: {sale.cashier}
                </p>
            </div>

            <div className="border-t border-dashed" />

            {/* Items */}
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-left text-muted-foreground">
                        <th className="pb-1 font-medium">Item</th>
                        <th className="pb-1 text-right font-medium">Qty</th>
                        <th className="pb-1 text-right font-medium">Price</th>
                        <th className="pb-1 text-right font-medium">Sub</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-0.5 pr-2 align-top">
                                <span className="line-clamp-1">{item.product_name}</span>
                                {item.discount > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                        {' '}disc -₱{item.discount.toFixed(2)}
                                    </span>
                                )}
                            </td>
                            <td className="py-0.5 text-right">{item.quantity}</td>
                            <td className="py-0.5 text-right">
                                ₱{item.unit_price.toFixed(2)}
                            </td>
                            <td className="py-0.5 text-right">
                                ₱{item.subtotal.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-dashed" />

            {/* Totals */}
            <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₱{sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span>-₱{sale.discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-base font-bold">
                    <span>TOTAL</span>
                    <span>₱{sale.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="border-t border-dashed" />

            {/* Payment */}
            <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="uppercase">{sale.payment_method}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tendered</span>
                    <span>₱{sale.amount_tendered.toFixed(2)}</span>
                </div>
                {sale.payment_method === 'cash' && (
                    <div className="flex justify-between font-semibold">
                        <span>Change</span>
                        <span>₱{sale.change_due.toFixed(2)}</span>
                    </div>
                )}
            </div>

            <div className="border-t border-dashed" />

            <p className="text-center text-xs text-muted-foreground">
                Thank you for your purchase!
            </p>
        </div>
    );
}
