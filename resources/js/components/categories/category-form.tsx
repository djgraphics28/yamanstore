import { Form, Link } from '@inertiajs/react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { FormSwitch } from '@/components/form-switch';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as categoriesIndex } from '@/routes/categories';
import type { Category } from '@/types';

export function CategoryForm({ category }: { category?: Category }) {
    const form = category
        ? CategoryController.update.form(category)
        : CategoryController.store.form();

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
