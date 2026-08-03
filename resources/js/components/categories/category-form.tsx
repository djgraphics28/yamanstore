import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { EntityCombobox } from '@/components/entity-combobox';
import { FormSwitch } from '@/components/form-switch';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as categoriesIndex } from '@/routes/categories';
import type { Category } from '@/types';

export function CategoryForm({
    category,
    majorCategories = [],
    hasChildren = false,
}: {
    category?: Category;
    majorCategories?: { id: number; name: string }[];
    hasChildren?: boolean;
}) {
    const form = category
        ? CategoryController.update.form(category)
        : CategoryController.store.form();

    const [parentId, setParentId] = useState<number | null>(
        category?.parent_id ?? null,
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
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={category?.name}
                            required
                            autoFocus
                            placeholder="e.g. Snacks"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={category?.description ?? ''}
                            placeholder="Short description of this category"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="parent_id">
                            Major category{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        {hasChildren ? (
                            <p className="text-sm text-muted-foreground">
                                This category has its own subcategories, so
                                it can&apos;t be nested under another major
                                category.
                            </p>
                        ) : (
                            <EntityCombobox
                                name="parent_id"
                                options={majorCategories}
                                value={parentId}
                                onChange={setParentId}
                                placeholder="None — this is a major category"
                                searchPlaceholder="Search major categories…"
                            />
                        )}
                        <InputError message={errors.parent_id} />
                    </div>

                    <div className="flex items-center gap-3">
                        <FormSwitch
                            name="is_active"
                            defaultChecked={category?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button disabled={processing}>
                            {category ? 'Save changes' : 'Create category'}
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href={categoriesIndex()}>Cancel</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
