import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, LayoutDashboard, Calendar, CreditCard, BarChart3, PlusCircle, Tag, History } from 'lucide-react';
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url ? dashboard.url() : '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: Calendar,
    },
    {
        title: 'Payment Transactions',
        href: '/transactions',
        icon: CreditCard,
    },
    {
        title: 'Pricing Plans',
        href: '/plans',
        icon: Tag,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Activity Logs',
        href: '/activity-logging',
        icon: History,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
