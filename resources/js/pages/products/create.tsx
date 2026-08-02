import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { ProductForm } from '@/components/products/product-form';
import { create, index } from '@/routes/products';
import type { Category, Supplier } from '@/types';

export default function CreateProduct({
    categories,
    suppliers,
}: {
    categories: Category[];
    suppliers: Supplier[];
}) {
    return (
        <>
            <Head title="Add product" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Add product"
                    description="Add a new product to your inventory"
                />

                <div className="max-w-2xl">
                    <ProductForm categories={categories} suppliers={suppliers} />
                </div>
            </div>
        </>
    );
}

CreateProduct.layout = {
    breadcrumbs: [
        { title: 'Products', href: index() },
        { title: 'Add product', href: create() },
    ],
};
