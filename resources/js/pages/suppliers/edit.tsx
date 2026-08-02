import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { edit, index } from '@/routes/suppliers';
import type { Supplier } from '@/types';

export default function EditSupplier({ supplier }: { supplier: Supplier }) {
    return (
        <>
            <Head title={`Edit ${supplier.name}`} />

            <div className="space-y-6 p-4">
                <Heading
                    title="Edit supplier"
                    description={`Update details for ${supplier.name}`}
                />

                <div className="max-w-xl">
                    <SupplierForm supplier={supplier} />
                </div>
            </div>
        </>
    );
}

EditSupplier.layout = (props: { supplier: Supplier }) => ({
    breadcrumbs: [
        { title: 'Suppliers', href: index() },
        { title: props.supplier.name, href: edit(props.supplier) },
    ],
});
