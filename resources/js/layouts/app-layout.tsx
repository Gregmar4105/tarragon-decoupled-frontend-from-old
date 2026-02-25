import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';
import { MobileNav } from '@/components/MobileNav';
import { Toaster } from 'sonner';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <>
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
        <MobileNav />
        <Toaster position="top-right" richColors />
    </>
);
