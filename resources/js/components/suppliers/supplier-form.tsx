import { Form, Link } from '@inertiajs/react';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import { FormSwitch } from '@/components/form-switch';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as suppliersIndex } from '@/routes/suppliers';
import type { Supplier } from '@/types';

export function SupplierForm({ supplier }: { supplier?: Supplier }) {
    const form = supplier
        ? SupplierController.update.form(supplier)
        : SupplierController.store.form();

    return (
        <Form
            {...form}
            options={{ preserveScroll: true }}
            className="space-y-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Supplier name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={supplier?.name}
                            required
                            autoFocus
                            placeholder="e.g. Coca-Cola Philippines"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contact_person">
                            Contact person{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="contact_person"
                            name="contact_person"
                            defaultValue={supplier?.contact_person ?? ''}
                            placeholder="e.g. Juan Dela Cruz"
                        />
                        <InputError message={errors.contact_person} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">
                                Phone{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={supplier?.phone ?? ''}
                                placeholder="09XXXXXXXXX"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                Email{' '}
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={supplier?.email ?? ''}
                                placeholder="supplier@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">
                            Address{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Textarea
                            id="address"
                            name="address"
                            defaultValue={supplier?.address ?? ''}
                            placeholder="Complete business address"
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="flex items-center gap-3">
                        <FormSwitch
                            name="is_active"
                            defaultChecked={supplier?.is_active ?? true}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button disabled={processing}>
                            {supplier ? 'Save changes' : 'Create supplier'}
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href={suppliersIndex()}>Cancel</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
