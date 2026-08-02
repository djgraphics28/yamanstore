import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { create, index } from '@/routes/suppliers';

export default function CreateSupplier() {
    return (
        <>
            <Head title="Add supplier" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Add supplier"
                    description="Register a new supplier"
                />

                <div className="max-w-xl">
                    <SupplierForm />
                </div>
            </div>
        </>
    );
}

CreateSupplier.layout = {
    breadcrumbs: [
        { title: 'Suppliers', href: index() },
        { title: 'Add supplier', href: create() },
    ],
};
