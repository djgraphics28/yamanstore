import { Head } from '@inertiajs/react';
import { CategoryForm } from '@/components/categories/category-form';
import Heading from '@/components/heading';
import { create, index } from '@/routes/categories';

export default function CreateCategory({
    majorCategories,
}: {
    majorCategories: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title="Add category" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Add category"
                    description="Create a new product category"
                />

                <div className="max-w-xl">
                    <CategoryForm majorCategories={majorCategories} />
                </div>
            </div>
        </>
    );
}

CreateCategory.layout = {
    breadcrumbs: [
        { title: 'Categories', href: index() },
        { title: 'Add category', href: create() },
    ],
};
