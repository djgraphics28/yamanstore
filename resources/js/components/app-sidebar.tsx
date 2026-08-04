import { Link } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    LayoutGrid,
    PackageIcon,
    PrinterIcon,
    ReceiptIcon,
    ShoppingCartIcon,
    TagsIcon,
    TruckIcon,
    UsersIcon,
    WalletIcon,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permission';
import { dashboard } from '@/routes';
import { index as categoriesIndex } from '@/routes/categories';
import { index as gcashIndex } from '@/routes/gcash';
import { index as posIndex } from '@/routes/pos';
import { index as salesIndex } from '@/routes/pos/sales';
import { index as printIndex } from '@/routes/print';
import { index as productsIndex } from '@/routes/products';
import { index as suppliersIndex } from '@/routes/suppliers';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Products',
        href: productsIndex(),
        icon: PackageIcon,
        permission: 'products.view',
    },
    {
        title: 'Categories',
        href: categoriesIndex(),
        icon: TagsIcon,
        permission: 'categories.view',
    },
    {
        title: 'Suppliers',
        href: suppliersIndex(),
        icon: TruckIcon,
        permission: 'suppliers.view',
    },
    {
        title: 'POS Terminal',
        href: posIndex(),
        icon: ShoppingCartIcon,
        permission: 'pos.view',
    },
    {
        title: 'Sales',
        href: salesIndex(),
        icon: ReceiptIcon,
        permission: 'pos.view',
    },
    {
        title: 'GCash',
        href: gcashIndex(),
        icon: WalletIcon,
        permission: 'gcash.view',
    },
    {
        title: 'Print',
        href: printIndex(),
        icon: PrinterIcon,
        permission: 'print.view',
    },
    {
        title: 'Users',
        href: usersIndex(),
        icon: UsersIcon,
        permission: 'users.view',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const permissions = usePermissions();
    const visibleNavItems = mainNavItems.filter(
        (item) => !item.permission || permissions.includes(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
