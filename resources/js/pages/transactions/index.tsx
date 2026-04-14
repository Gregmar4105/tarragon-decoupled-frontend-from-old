import { Head, router } from '@inertiajs/react';
import { subDays, format } from 'date-fns';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useCurrency } from '@/context/CurrencyContext';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

interface TransactionData {
    id: string;
    date: string;
    customer: string;
    email: string;
    source: string;
    bookingId: string;
    amount: number;
    method: string;
    status: string;
}

interface StatsData {
    totalRevenue: number;
    totalTransactions: number;
    averageTransaction: number;
}

interface Props {
    initialTransactions: TransactionData[];
    stats: StatsData;
}

export default function Transactions({ initialTransactions, stats }: Props) {
    const { format: formatCurrency } = useCurrency();

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

    // Parse initial dates from URL or default
    const defaultFrom = searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : subDays(new Date(), 30);
    const defaultTo = searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : new Date();

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: defaultFrom,
        to: defaultTo,
    });
    const [source, setSource] = useState(searchParams.get('source') || 'all');
    const [method, setMethod] = useState(searchParams.get('method') || 'all');

    useEffect(() => {
        const query: Record<string, string> = {};
        if (dateRange?.from) query.start_date = format(dateRange.from, 'yyyy-MM-dd');
        if (dateRange?.to) query.end_date = format(dateRange.to, 'yyyy-MM-dd');
        if (source !== 'all') query.source = source;
        if (method !== 'all') query.method = method;

        router.get(window.location.pathname, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [dateRange, source, method]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['initialTransactions', 'stats'] });
        }, 15000); // Poll every 15 seconds

        return () => clearInterval(interval);
    }, []);

    // Provide default fallback values if stats are missing
    const totalRevenue = stats?.totalRevenue || 0;
    const totalTransactions = stats?.totalTransactions || 0;
    const averageTransaction = stats?.averageTransaction || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Transactions" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold tracking-tight">Payment Transactions</h1>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end flex-wrap">
                        <div className="flex flex-col gap-2 w-full md:flex-1 md:min-w-[300px]">
                            <span className="text-sm font-medium">Date Range</span>
                            <DateRangePicker
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-[200px]">
                            <span className="text-sm font-medium">Source</span>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="walk-in">Walk-in</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-[200px]">
                            <span className="text-sm font-medium">Payment Method</span>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="cash">Cash Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm"
                            onClick={() => {
                                const query = new URLSearchParams(window.location.search);
                                window.location.href = `/transactions/export?${query.toString()}`;
                            }}
                        >
                            <Download className="h-4 w-4" />
                            Export to CSV
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                            <div className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</div>
                            <span className="text-xs text-green-600">↑ Up to date</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <span className="text-sm font-medium text-muted-foreground">Total Transactions</span>
                            <div className="text-2xl font-bold mt-1">{totalTransactions}</div>
                            <span className="text-xs text-muted-foreground">All time</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <span className="text-sm font-medium text-muted-foreground">Average Transaction</span>
                            <div className="text-2xl font-bold mt-1">{formatCurrency(averageTransaction)}</div>
                            <span className="text-xs text-muted-foreground">Per booking</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card className="overflow-hidden w-full">
                    <CardContent className="p-0 overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialTransactions.map((txn) => (
                                    <TableRow key={txn.id}>
                                        <TableCell className="font-medium">{txn.id}</TableCell>
                                        <TableCell>{txn.date}</TableCell>
                                        <TableCell>{txn.customer}</TableCell>
                                        <TableCell>{txn.email}</TableCell>
                                        <TableCell>{txn.source}</TableCell>
                                        <TableCell>{txn.bookingId}</TableCell>
                                        <TableCell className="font-bold">{formatCurrency(txn.amount)}</TableCell>
                                        <TableCell>{txn.method}</TableCell>
                                        <TableCell><StatusBadge status={txn.status} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
