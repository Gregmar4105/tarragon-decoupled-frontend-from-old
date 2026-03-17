import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Calendar, ScanLine, CreditCard, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function MobileNav() {
    const { url } = usePage();

    const leftLinks = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/bookings', icon: Calendar, label: 'Bookings' },
    ];

    const rightLinks = [
        { href: '/transactions', icon: CreditCard, label: 'Transactions' },
        { href: '/reports', icon: BarChart3, label: 'Reports' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 md:hidden safe-area-bottom">
            <div className="flex items-center justify-between max-w-md mx-auto relative px-2">
                {leftLinks.map((link) => {
                    const isActive = url.startsWith(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[56px] px-1",
                                isActive ? "text-orange-600" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <link.icon className={cn("w-5 h-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium whitespace-nowrap">{link.label}</span>
                        </Link>
                    )
                })}

                {/* Spacer for center button */}
                <div className="w-16"></div>

                {rightLinks.map((link) => {
                    const isActive = url.startsWith(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[56px] px-1",
                                isActive ? "text-orange-600" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <link.icon className={cn("w-5 h-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium whitespace-nowrap">{link.label}</span>
                        </Link>
                    )
                })}

                {/* Floating Action Button for Scan QR */}
                <div className="absolute left-1/2 -top-6 -translate-x-1/2">
                    <Link href="/bookings?scan=true" className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] border-4 border-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                        <ScanLine className="w-6 h-6 text-white" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
