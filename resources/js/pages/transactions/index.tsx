import { Head } from '@inertiajs/react';
import { subDays } from 'date-fns';
import { Download } from 'lucide-react';
import { useState } from 'react';
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
    const { format } = useCurrency();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // Provide default fallback values if stats are missing
    const totalRevenue = stats?.totalRevenue || 0;
    const totalTransactions = stats?.totalTransactions || 0;
    const averageTransaction = stats?.averageTransaction || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions & Export" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold tracking-tight">Transactions & Export</h1>

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
                            <Select defaultValue="all">
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
                            <Select defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="cash">Cash Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm">
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
                            <div className="text-2xl font-bold mt-1">{format(totalRevenue)}</div>
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
                            <div className="text-2xl font-bold mt-1">{format(averageTransaction)}</div>
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
                                        <TableCell>{txn.source}</TableCell>
                                        <TableCell>{txn.bookingId}</TableCell>
                                        <TableCell className="font-bold">{format(txn.amount)}</TableCell>
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
