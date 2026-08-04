import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { UserForm } from '@/components/users/user-form';
import { edit, index } from '@/routes/users';
import type { Auth, EditableUser } from '@/types';

export default function EditUser({
    user,
    availableRoles,
}: {
    user: EditableUser;
    availableRoles: string[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSelf = auth.user.id === user.id;

    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="space-y-6 p-4">
                <Heading
                    title={`Edit ${user.name}`}
                    description="Update account details and role assignment"
                />

                <div className="max-w-xl">
                    <UserForm
                        user={user}
                        availableRoles={availableRoles}
                        isSelf={isSelf}
                    />
                </div>
            </div>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Edit user', href: edit(0) },
    ],
};
