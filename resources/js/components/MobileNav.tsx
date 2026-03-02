import { Link, usePage } from '@inertiajs/react';
import { Home, Search, PlusCircle, LayoutDashboard, User } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MobileNav() {
    const { url } = usePage();

    const links = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/track', icon: Search, label: 'Track' },
        { href: '/dashboard', icon: LayoutDashboard, label: 'Admin' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2 md:hidden safe-area-bottom">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
                {links.map((link) => {
                    const isActive = url === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[64px]",
                                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <link.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    )
                })}

                {/* Floating Action Button for Booking */}
                <div className="absolute left-1/2 -top-8 -translate-x-1/2">
                    <BookingModal>
                        <Button className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center p-0 border-4 border-gray-50">
                            <PlusCircle className="w-8 h-8 text-white" />
                        </Button>
                    </BookingModal>
                </div>
            </div>
        </div>
    );
}
