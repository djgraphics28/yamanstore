import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { UserForm } from '@/components/users/user-form';
import { create, index } from '@/routes/users';

export default function CreateUser({
    availableRoles,
}: {
    availableRoles: string[];
}) {
    return (
        <>
            <Head title="Add user" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Add user"
                    description="Create a new staff account and assign a role"
                />

                <div className="max-w-xl">
                    <UserForm availableRoles={availableRoles} />
                </div>
            </div>
        </>
    );
}

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Users', href: index() },
        { title: 'Add user', href: create() },
    ],
};
