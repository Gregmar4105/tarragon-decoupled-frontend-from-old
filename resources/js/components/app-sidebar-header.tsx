import { Breadcrumbs } from '@/components/breadcrumbs';
import CurrencyToggle from '@/components/CurrencyToggle';
import NotificationBell from '@/components/NotificationBell';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<{ auth: { user: User } }>().props;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="hidden md:flex -ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                <CurrencyToggle />
                <NotificationBell />
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full h-8 w-8 ml-1">
                            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-orange-200">
                                {/* @ts-ignore */}
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="bg-orange-100 text-orange-700 font-medium text-xs">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-1">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
