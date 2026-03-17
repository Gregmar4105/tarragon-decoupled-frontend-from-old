import { useState } from 'react';
import { Bell, Check, Info, AlertTriangle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Notification = {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning';
};

const initialNotifications: Notification[] = [
    {
        id: '1',
        title: 'Booking Confirmed',
        message: 'Your booking BK800000001 has been successfully confirmed.',
        time: '2 mins ago',
        read: false,
        type: 'success'
    },
    {
        id: '2',
        title: 'System Update',
        message: 'Platform maintenance scheduled for tomorrow at 2 AM.',
        time: '1 hour ago',
        read: false,
        type: 'info'
    },
    {
        id: '3',
        title: 'Payment Received',
        message: 'Payment of $10.00 was successfully processed.',
        time: '3 hours ago',
        read: true,
        type: 'success'
    },
    {
        id: '4',
        title: 'Complete Profile',
        message: 'Please complete your profile details to verify your account.',
        time: '1 day ago',
        read: true,
        type: 'warning'
    }
];

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    return (

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative group transition-all duration-300 ease-in-out hover:bg-gray-100 rounded-full h-10 w-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                    <div className={`transition-all duration-300 ${unreadCount > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`}>
                        <Bell className={`h-5 w-5 text-gray-600 transition-colors ${unreadCount > 0 ? 'group-hover:text-orange-500' : ''}`} />
                    </div>

                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-900">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                            className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <Bell className="h-10 w-10 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex gap-4 ${notification.read ? 'opacity-70' : 'bg-orange-50/30'}`}
                                >
                                    <div className={`mt-1 shrink-0 h-2 w-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-orange-500'}`} />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm ${notification.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{notification.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                    <button className="text-xs font-bold text-gray-600 hover:text-gray-900">
                        View All Activity
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
