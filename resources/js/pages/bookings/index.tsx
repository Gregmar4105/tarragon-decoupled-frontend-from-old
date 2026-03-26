import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Briefcase,
    Clock,
    CheckCircle,
    LayoutGrid,
    List,
    ScanLine,
    Eye,
    Pencil,
    Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import BookingKanban from '@/components/BookingKanban';
import BookingScanner from '@/components/BookingScanner';
import { EditBookingModal } from '@/components/EditBookingModal';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrency } from '@/context/CurrencyContext';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Bookings',
        href: '/bookings',
    },
];

interface Bags {
    [key: string]: number;
}

interface BookingInterface {
    id: string;
    customer: string;
    contact: string;
    bags: Bags;
    amount: number;
    status: string;
    payment_status: string;
    source: string;
    checkIn: string;
    checkOut: string;
}

interface Props {
    initialBookings: BookingInterface[];
}

export default function Bookings({ initialBookings }: Props) {
    const { format } = useCurrency();
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'list' | 'board'>('list');

    // Scanner State
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingInterface | null>(null);

    const [bookings, setBookings] = useState<BookingInterface[]>(initialBookings || []);

    useEffect(() => {
        setBookings(initialBookings || []);
        
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('scan') === 'true') {
            setIsScannerOpen(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [initialBookings]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['initialBookings'] });
        }, 15000); // 15 seconds polling

        return () => clearInterval(interval);
    }, []);

    const handleCheckIn = (bookingId: string, tagNumber: string, notes?: string) => {
        setBookings(currentBookings =>
            currentBookings.map(booking =>
                booking.id === bookingId
                    ? { ...booking, status: 'Checked-in', tagNumber, notes }
                    : booking
            )
        );
    };

    const activeCount = bookings.filter(b => b.status.toLowerCase() === 'checked-in').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings Management" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Bookings Management</h1>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 justify-end">
                            <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 rounded-md ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    onClick={() => setView('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 rounded-md ${view === 'board' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    onClick={() => setView('board')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                className="gap-2 border-dashed border-gray-300 hidden md:flex shrink-0"
                                onClick={() => setIsScannerOpen(true)}
                            >
                                <ScanLine className="h-4 w-4" />
                                Scan QR
                            </Button>

                            <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-sm shrink-0" asChild>
                                <Link href="/bookings/create">
                                    <Plus className="h-4 w-4" />
                                    Add Walk-in
                                </Link>
                            </Button>
                        </div>
                </div>

                {view === 'list' ? (
                    <>
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, booking ID, email..."
                                        className="pl-8 w-full"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full md:w-[160px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="checked-in">Checked-in</SelectItem>
                                            <SelectItem value="checked-out">Checked-out</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full md:w-[160px]">
                                            <SelectValue placeholder="Payment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Payments</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full md:w-[160px]">
                                            <SelectValue placeholder="Source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Sources</SelectItem>
                                            <SelectItem value="online">Online</SelectItem>
                                            <SelectItem value="walk-in">Walk-in</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* KPI Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                                        <p className="text-2xl font-bold">{bookings.length}</p>
                                    </div>
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                                        <p className="text-2xl font-bold">{activeCount}</p>
                                    </div>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                            {/* ... more KPI cards if needed */}
                        </div>

                        {/* Table */}
                        <Card className="overflow-hidden w-full">
                            <CardContent className="p-0 overflow-x-auto">
                                <Table className="min-w-[800px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Booking ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Bags</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Source</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">{booking.id}</TableCell>
                                                <TableCell>{booking.customer}</TableCell>
                                                <TableCell>{booking.contact}</TableCell>
                                                <TableCell>
                                                    {Object.entries(booking.bags)
                                                        .filter(([_, count]) => count > 0)
                                                        .map(([type, count]) => `${count} ${type}`)
                                                        .join(', ')}
                                                </TableCell>
                                                <TableCell>{format(booking.amount)}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={booking.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={booking.payment_status} />
                                                </TableCell>
                                                <TableCell>{booking.source}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                                                        <Link href={`/bookings/${booking.id}`}>
                                                                            <Eye className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>View Details</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                        onClick={() => {
                                                                            setSelectedBooking(booking);
                                                                            setIsEditModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Booking</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Delete Booking</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <BookingKanban bookings={bookings} onStatusChange={(id, status) => {
                        setBookings(current => current.map(b => b.id === id ? { ...b, status } : b));
                    }} />
                )}

                <BookingScanner
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    bookings={bookings}
                    onCheckIn={handleCheckIn}
                />

                <EditBookingModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    booking={selectedBooking}
                />
            </div>
        </AppLayout>
    );
}
