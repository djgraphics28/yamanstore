import { PackageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PosProduct } from '@/types';

export function ProductCard({
    product,
    inCart,
    onClick,
}: {
    product: PosProduct;
    inCart: number;
    onClick: (product: PosProduct) => void;
}) {
    const outOfStock = product.current_stock <= 0;

    return (
        <Card
            className={cn(
                'relative cursor-pointer transition-all duration-150 select-none',
                outOfStock
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-primary hover:shadow-md active:scale-[0.98]',
            )}
            onClick={() => {
                if (!outOfStock) onClick(product);
            }}
        >
            {inCart > 0 && (
                <span className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {inCart}
                </span>
            )}

            <CardContent className="p-2">
                {/* Image / Placeholder */}
                <div className="mb-2 flex h-20 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <PackageIcon className="h-8 w-8 text-muted-foreground/40" />
                    )}
                </div>

                {/* Name */}
                <p className="line-clamp-2 text-xs font-medium leading-tight">
                    {product.name}
                </p>

                {/* SKU */}
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {product.sku}
                </p>

                {/* Price & stock row */}
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        ₱{product.selling_price.toFixed(2)}
                    </span>
                    {outOfStock ? (
                        <Badge variant="destructive" className="text-[9px]">
                            Out
                        </Badge>
                    ) : (
                        <span className="text-[10px] text-muted-foreground">
                            {product.current_stock} left
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
