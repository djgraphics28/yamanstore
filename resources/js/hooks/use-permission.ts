import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

export function usePermission(permission: string): boolean {
    const { auth } = usePage<{ auth: Auth }>().props;

    return auth.permissions.includes(permission);
}

export function usePermissions(): string[] {
    const { auth } = usePage<{ auth: Auth }>().props;

    return auth.permissions;
}
