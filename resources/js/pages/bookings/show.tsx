import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { ArrowLeft, Clock, Calendar, User, Phone, Mail, Package, CreditCard, Tag, Banknote } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

// Mock data - duplicated from index.tsx for demo purposes
const bookingsData = [
    { id: "BK800000001", customer: "John Smith", email: "john.smith@example.com", phone: "+1 234-567-8900", bags: { small: 1, medium: 2, large: 0 }, amount: 63, status: "Booked", source: "Online", checkIn: "2026-01-28 10:00 AM", checkOut: "2026-01-28 06:00 PM" },
    { id: "BK800000002", customer: "Sarah Johnson", email: "sarah.j@example.com", phone: "+1 987-654-3210", bags: { small: 2, medium: 0, large: 0 }, amount: 45, status: "Checked-in", source: "Walk-in", checkIn: "2026-01-28 11:30 AM", checkOut: "2026-01-28 04:00 PM" },
    { id: "BK800000003", customer: "Michael Brown", email: "m.brown@example.com", phone: "+1 555-123-4567", bags: { small: 0, medium: 3, large: 1 }, amount: 75, status: "Checked-out", source: "Online", checkIn: "2026-01-27 09:15 AM", checkOut: "2026-01-27 05:00 PM" },
    { id: "BK800000004", customer: "Emily Davis", email: "emily.d@example.com", phone: "+1 123-456-7890", bags: { small: 1, medium: 1, large: 0 }, amount: 30, status: "Booked", source: "Online", checkIn: "2026-01-28 01:00 PM", checkOut: "2026-01-28 08:00 PM" },
];

const getMockBooking = (id: string) => {
    // Lookup by ID, default to first or fallback
    const found = bookingsData.find(b => b.id === id);
    if (found) {
        return {
            ...found,
            tagNumber: found.status !== 'Booked' ? "TAG-123" : undefined,
            notes: "Fragile item."
        };
    }

    // Fallback for demo if ID not found in list (shouldn't happen with correct links)
    return {
        id: id || "BK800000001",
        customer: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 234-567-8900",
        bags: { small: 1, medium: 2, large: 0 },
        amount: 63,
        status: "Booked",
        source: "Online",
        checkIn: "2026-01-28 10:00 AM",
        checkOut: "2026-01-28 06:00 PM",
        tagNumber: undefined,
        notes: "Fragile item in medium bag."
    };
};

export default function BookingShow({ bookingId }: { bookingId?: string }) {
    const { format } = useCurrency();
    const booking = getMockBooking(bookingId || "BK800000001");

    const breadcrumbs = [
        {
            title: 'Bookings',
            href: '/bookings',
        },
        {
            title: booking.id,
            href: `/bookings/${booking.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Booking ${booking.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/bookings">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
                        <p className="text-muted-foreground text-sm">View complete information for this booking.</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline">Edit Booking</Button>
                        <Button variant="destructive">Delete</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">Booking #{booking.id}</CardTitle>
                                        <CardDescription>Created via {booking.source}</CardDescription>
                                    </div>
                                    <StatusBadge status={booking.status} className="text-base px-3 py-1" />
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Check-in Time</label>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            {booking.checkIn}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Check-out Time</label>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            {booking.checkOut}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tag Number</label>
                                    <div className="flex items-center gap-2 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit">
                                        <Tag className="h-4 w-4 text-blue-500" />
                                        <span className="font-mono">{booking.tagNumber || "Not Assigned"}</span>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Notes</label>
                                        <p className="text-sm bg-yellow-50 p-3 rounded-md text-yellow-800 border-yellow-100">{booking.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Baggage Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(booking.bags).map(([type, count]) => (
                                        count > 0 && (
                                            <div key={type} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-2 rounded-full border shadow-sm">
                                                        <Package className="h-5 w-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium capitalize">{type} Bag</p>
                                                        <p className="text-xs text-muted-foreground">Standard storage item</p>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-lg">x{count}</div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{booking.customer}</p>
                                        <p className="text-xs text-muted-foreground">Registered Customer</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline">{booking.email}</a>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{booking.phone}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="font-bold text-xl">{format(booking.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Paid</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Method</span>
                                    <div className="flex items-center gap-1">
                                        <Banknote className="h-3 w-3" />
                                        <span>Cash Payment</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
