import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { ProductForm } from '@/components/products/product-form';
import { edit, index } from '@/routes/products';
import type { Category, Product, Supplier } from '@/types';

export default function EditProduct({
    product,
    categories,
    suppliers,
}: {
    product: Product;
    categories: Category[];
    suppliers: Supplier[];
}) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <div className="space-y-6 p-4">
                <Heading
                    title="Edit product"
                    description={`Update details for ${product.name}`}
                />

                <div className="max-w-2xl">
                    <ProductForm
                        product={product}
                        categories={categories}
                        suppliers={suppliers}
                    />
                </div>
            </div>
        </>
    );
}

EditProduct.layout = (props: { product: Product }) => ({
    breadcrumbs: [
        { title: 'Products', href: index() },
        { title: props.product.name, href: edit(props.product) },
    ],
});
