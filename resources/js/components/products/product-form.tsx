import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import { EntityCombobox } from '@/components/entity-combobox';
import { ImageUpload } from '@/components/image-upload';
import InputError from '@/components/input-error';
import { SupplierPriceList } from '@/components/products/supplier-price-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { index as productsIndex } from '@/routes/products';
import type { Category, Product, ProductStatus, Supplier } from '@/types';

export function ProductForm({
    product,
    categories,
    suppliers,
}: {
    product?: Product;
    categories: Category[];
    suppliers: Supplier[];
}) {
    const form = product
        ? ProductController.update.form(product)
        : ProductController.store.form();

    const [categoryId, setCategoryId] = useState<number | null>(
        product?.category_id ?? null,
    );
    const [status, setStatus] = useState<ProductStatus>(
        product?.status ?? 'active',
    );

    return (
        <Form
            {...form}
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label>Product image</Label>
                        <ImageUpload
                            name="image"
                            initialImageUrl={product?.image_url}
                        />
                        <InputError message={errors.image} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Product name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={product?.name}
                            required
                            autoFocus
                            placeholder="e.g. Coca-Cola 1.5L"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                name="sku"
                                defaultValue={product?.sku}
                                required
                                placeholder="e.g. SKU-00001"
                            />
                            <InputError message={errors.sku} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="barcode">
                                Barcode{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="barcode"
                                name="barcode"
                                defaultValue={product?.barcode ?? ''}
                                placeholder="e.g. 4801234567890"
                            />
                            <InputError message={errors.barcode} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <EntityCombobox
                            name="category_id"
                            options={categories}
                            value={categoryId}
                            onChange={setCategoryId}
                            placeholder="Select category"
                            searchPlaceholder="Search categories…"
                        />
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="brand">
                            Brand{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="brand"
                            name="brand"
                            defaultValue={product?.brand ?? ''}
                            placeholder="e.g. Coca-Cola"
                        />
                        <InputError message={errors.brand} />
                    </div>

                    <div className="grid gap-2">
                        <SupplierPriceList
                            suppliers={suppliers}
                            initialRows={product?.supplier_prices?.map(
                                (price) => ({
                                    supplier_id: price.supplier_id,
                                    cost_price: price.cost_price,
                                    is_preferred: price.is_preferred,
                                }),
                            )}
                        />
                        <InputError
                            message={
                                errors['supplier_prices.0.supplier_id'] ??
                                errors['supplier_prices.0.cost_price']
                            }
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="selling_price">
                                Selling price
                            </Label>
                            <Input
                                id="selling_price"
                                name="selling_price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product?.selling_price}
                                required
                            />
                            <InputError message={errors.selling_price} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                name="unit"
                                defaultValue={product?.unit ?? 'pc'}
                                required
                                placeholder="pc, pack, kg…"
                            />
                            <InputError message={errors.unit} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="current_stock">
                                Current stock
                            </Label>
                            <Input
                                id="current_stock"
                                name="current_stock"
                                type="number"
                                min="0"
                                defaultValue={product?.current_stock ?? 0}
                                required
                            />
                            <InputError message={errors.current_stock} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="minimum_stock">
                                Minimum stock
                            </Label>
                            <Input
                                id="minimum_stock"
                                name="minimum_stock"
                                type="number"
                                min="0"
                                defaultValue={product?.minimum_stock ?? 0}
                                required
                            />
                            <InputError message={errors.minimum_stock} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="expiration_date">
                                Expiration date{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="expiration_date"
                                name="expiration_date"
                                type="date"
                                defaultValue={product?.expiration_date ?? ''}
                            />
                            <InputError message={errors.expiration_date} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="hidden" name="status" value={status} />
                        <Switch
                            id="status"
                            checked={status === 'active'}
                            onCheckedChange={(checked) =>
                                setStatus(checked ? 'active' : 'inactive')
                            }
                        />
                        <Label htmlFor="status">Active</Label>
                        <InputError message={errors.status} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button disabled={processing}>
                            {product ? 'Save changes' : 'Create product'}
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href={productsIndex()}>Cancel</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
