import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { StatsCard } from '@/components/stats-card';
import { RevenueChart } from '@/components/RevenueChart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Luggage, ScanBarcode, Download, Banknote, UserCheck, Clock, ArrowUpRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
    },
];

// Moved stats inside component to access context or removed hardcoded values
const getStats = (format: (n: number) => string) => [
    { title: "Active Bags", value: 25, icon: <Luggage className="h-4 w-4" />, description: "Capacity: 150", trend: { value: 12, label: "from yesterday", direction: "up" as const } },
    { title: "Revenue (Today)", value: format(125), icon: <Banknote className="h-4 w-4" />, description: `Avg. ${format(5)}/bag`, trend: { value: 4, label: "from yesterday", direction: "up" as const } },
    { title: "Check-ins", value: 12, icon: <UserCheck className="h-4 w-4" />, description: "Pending: 3", trend: { value: 2, label: "from yesterday", direction: "down" as const } },
    { title: "Avg. Duration", value: "4.5 hrs", icon: <Clock className="h-4 w-4" />, description: "Target: 5 hrs", trend: { value: 0, label: "same as yesterday", direction: "neutral" as const } },
];

interface RecentBooking {
    id: string;
    customer: string;
    status: string;
    payment: string;
    transactionId: string;
}

interface RecentSale {
    name: string;
    email: string;
    amount: number;
}

interface DashboardProps {
    recentBookings: RecentBooking[];
    recentSales: RecentSale[];
}

export default function Dashboard({ recentBookings = [], recentSales = [] }: DashboardProps) {
    const { format } = useCurrency();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000); // Mock loading delay
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Manage your luggage storage operations.</p>
                    </div>

                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))
                    ) : (
                        getStats(format).map((stat, i) => (
                            <StatsCard key={i} {...stat} />
                        ))
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 overflow-hidden w-full">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            {isLoading ? (
                                <Skeleton className="h-[350px] w-full" />
                            ) : (
                                <RevenueChart />
                            )}
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 overflow-hidden w-full">
                        <CardHeader>
                            <CardTitle>Recent Sales</CardTitle>
                            <CardDescription>
                                You made 265 sales this month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentSales.map((sale, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{sale.name}</p>
                                            <p className="text-sm text-muted-foreground">{sale.email}</p>
                                        </div>
                                        <div className="ml-auto font-medium">+{format(sale.amount)}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Bookings Section */}
                <Card className="overflow-hidden w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Bookings</CardTitle>
                            <CardDescription>Latest transactions and storage activities.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export to CSV
                        </Button>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead className="text-right">Transaction ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-[100px] ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    recentBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.id}</TableCell>
                                            <TableCell>{booking.customer}</TableCell>
                                            <TableCell>{booking.status}</TableCell>
                                            <TableCell>{booking.payment}</TableCell>
                                            <TableCell className="text-right">{booking.transactionId}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
