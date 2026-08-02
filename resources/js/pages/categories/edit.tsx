import { Head } from '@inertiajs/react';
import { CategoryForm } from '@/components/categories/category-form';
import Heading from '@/components/heading';
import { edit, index } from '@/routes/categories';
import type { Category } from '@/types';

export default function EditCategory({ category }: { category: Category }) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />

            <div className="space-y-6 p-4">
                <Heading
                    title="Edit category"
                    description={`Update details for ${category.name}`}
                />

                <div className="max-w-xl">
                    <CategoryForm category={category} />
                </div>
            </div>
        </>
    );
}

EditCategory.layout = (props: { category: Category }) => ({
    breadcrumbs: [
        { title: 'Categories', href: index() },
        { title: props.category.name, href: edit(props.category) },
    ],
});
