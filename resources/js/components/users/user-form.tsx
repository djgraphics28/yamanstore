import { Form, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/users';
import type { EditableUser, UserRole } from '@/types';

export function UserForm({
    user,
    availableRoles,
    isSelf = false,
}: {
    user?: EditableUser;
    availableRoles: string[];
    isSelf?: boolean;
}) {
    const routeDef = user
        ? UserController.update(user.id)
        : UserController.store();

    return (
        <Form
            action={routeDef}
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
                            defaultValue={user?.name}
                            required
                            autoFocus
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user?.email}
                            required
                            placeholder="name@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            Password{' '}
                            {user && (
                                <span className="text-muted-foreground">
                                    (optional)
                                </span>
                            )}
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required={!user}
                            placeholder={
                                user ? 'Leave blank to keep current' : undefined
                            }
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required={!user}
                            placeholder={
                                user ? 'Leave blank to keep current' : undefined
                            }
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            name="role"
                            defaultValue={user?.role ?? ''}
                            disabled={isSelf}
                        >
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableRoles.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isSelf && (
                            <p className="text-sm text-muted-foreground">
                                You cannot change your own role.
                            </p>
                        )}
                        <InputError message={errors.role} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button disabled={processing}>
                            {user ? 'Save changes' : 'Create user'}
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href={index()}>Cancel</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

export function roleBadgeVariant(
    role: UserRole | null,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (role) {
        case 'Administrator':
            return 'destructive';
        case 'Manager':
            return 'default';
        case 'Cashier':
            return 'secondary';
        default:
            return 'outline';
    }
}
