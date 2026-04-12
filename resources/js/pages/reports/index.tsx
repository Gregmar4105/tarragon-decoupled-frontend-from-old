import { Head, router } from '@inertiajs/react';
import { format, subDays } from 'date-fns';
import { Download, TrendingUp, Briefcase, Users, DollarSign, Calendar as CalendarIcon, Mail, Phone, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { DailyBookingsChart } from '@/components/DailyBookingsChart';
import { DateRangePicker } from '@/components/DateRangePicker';
import { SourcePieChart } from '@/components/SourcePieChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface Booking {
    id: number;
    reference: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_price: number;
    status: string;
    source: string;
    created_at: string;
    bags: number;
}

interface Props {
    dailyTrend: Array<{ name: string; bookings: number }>;
    sourceDistribution: Array<{ name: string; value: number }>;
    summary: {
        totalBookings: number;
        totalBags: number;
        totalRevenue: number;
        avgBookingValue: number;
    };
    recentBookings: Booking[];
}

export default function Reports({ dailyTrend, sourceDistribution, summary, recentBookings }: Props) {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    
    const defaultFrom = searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : subDays(new Date(), 6);
    const defaultTo = searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : new Date();

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: defaultFrom,
        to: defaultTo,
    });

    useEffect(() => {
        const query: Record<string, string> = {};
        if (dateRange?.from) query.start_date = format(dateRange.from, 'yyyy-MM-dd');
        if (dateRange?.to) query.end_date = format(dateRange.to, 'yyyy-MM-dd');

        router.get(window.location.pathname, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [dateRange]);

    const getDateRangeDescription = () => {
        if (!dateRange?.from) return 'Select a date range';
        if (!dateRange?.to) return `From ${format(dateRange.from, 'LLL dd, y')}`;
        return `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/reports' }]}>
            <Head title="Reports & Analytics" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {getDateRangeDescription()}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <DateRangePicker
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />
                        <Button 
                            className="w-full sm:w-auto gap-2 bg-orange-500 hover:bg-orange-600 shadow-sm text-white"
                            onClick={() => {
                                const query = new URLSearchParams(window.location.search);
                                window.location.href = `/reports/export?${query.toString()}`;
                            }}
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 px-5">
                                    <Sparkles className="w-4 h-4" /> AI Insights
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="sm:max-w-2xl p-0 border-l border-border bg-card">
                                <AIInsightsPanel dateRange={dateRange} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white/50 backdrop-blur-sm border-orange-100 hover:border-orange-200 transition-colors shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Est. Revenue</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <DollarSign className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground mt-1 lowercase">
                                {getDateRangeDescription()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 backdrop-blur-sm border-orange-100 hover:border-orange-200 transition-colors shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Users className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalBookings}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                New bookings received
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 backdrop-blur-sm border-orange-100 hover:border-orange-200 transition-colors shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Bags Stored</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Briefcase className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalBags}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total luggage count
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/50 backdrop-blur-sm border-orange-100 hover:border-orange-200 transition-colors shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Value</CardTitle>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.avgBookingValue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Per booking average
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-2 overflow-hidden shadow-sm">
                        <CardHeader>
                            <CardTitle>Daily Bookings Trend</CardTitle>
                            <CardDescription>Number of bags stored per day in the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DailyBookingsChart data={dailyTrend} />
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden shadow-sm">
                        <CardHeader>
                            <CardTitle>Booking Sources</CardTitle>
                            <CardDescription>Channel distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SourcePieChart data={sourceDistribution} />
                        </CardContent>
                    </Card>
                </div>



                {/* Detailed Activity Table */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Detailed Activity</CardTitle>
                            <CardDescription>Individual booking records for the selected period</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-muted-foreground font-normal">
                            {recentBookings.length} results
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-md border-t">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[120px]">Reference</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-center">Bags</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                                No bookings found for the selected date range.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentBookings.map((booking) => (
                                            <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-mono text-xs font-bold text-orange-600">
                                                    #{booking.reference}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{booking.customer_name}</div>
                                                    <div className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded inline-block mt-1">
                                                        {booking.source === 'online' ? 'Online' : 'Walk-in'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <Mail className="w-3 h-3 text-muted-foreground" />
                                                            {booking.customer_email || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                                            {booking.customer_phone || 'N/A'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-bold">
                                                    {booking.bags}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(booking.total_price)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="secondary"
                                                        className={cn(
                                                            "text-[10px] uppercase tracking-wider font-bold",
                                                            booking.status === 'Checked-out' && "bg-green-100 text-green-700",
                                                            booking.status === 'Checked-in' && "bg-blue-100 text-blue-700",
                                                            booking.status === 'Pending' && "bg-yellow-100 text-yellow-700",
                                                            booking.status === 'Cancelled' && "bg-red-100 text-red-700"
                                                        )}
                                                    >
                                                        {booking.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {booking.created_at}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={`/bookings/${booking.reference}`}>
                                                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

