import { Toaster } from 'sonner';
import { MobileNav } from '@/components/MobileNav';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <>
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
        <MobileNav />
        <Toaster position="top-right" richColors />
    </>
);
