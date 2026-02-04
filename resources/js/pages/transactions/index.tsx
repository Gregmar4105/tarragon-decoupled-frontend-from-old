import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Download, CalendarIcon } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const breadcrumbs = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

const transactions = [
    { id: "800000001", date: "01/28 10:00 AM", customer: "John Smith", source: "Online", bookingId: "BK800000001", amount: 63, method: "Cash", status: "Completed" },
    { id: "800000002", date: "01/28 09:00 AM", customer: "Emma Johnson", source: "Walk-in", bookingId: "BK800000002", amount: 20, method: "Cash", status: "Completed" },
];

export default function Transactions() {
    const { format } = useCurrency();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions & Export" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold tracking-tight">Transactions & Export</h1>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end flex-wrap">
                        <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
                            <span className="text-sm font-medium">Date Range</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                                    <CalendarIcon className="mr-2 h-4 w-4" /> mm/dd/yyyy
                                </Button>
                                <span>-</span>
                                <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                                    <CalendarIcon className="mr-2 h-4 w-4" /> mm/dd/yyyy
                                </Button>
                            </div>
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

                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 whitespace-nowrap">
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
                            <div className="text-2xl font-bold mt-1">{format(350)}</div>
                            <span className="text-xs text-green-600">↑ 12% from last period</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <span className="text-sm font-medium text-muted-foreground">Total Transactions</span>
                            <div className="text-2xl font-bold mt-1">7</div>
                            <span className="text-xs text-muted-foreground">Last 7 days</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <span className="text-sm font-medium text-muted-foreground">Average Transaction</span>
                            <div className="text-2xl font-bold mt-1">{format(50)}</div>
                            <span className="text-xs text-muted-foreground">Per booking</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
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
                                {transactions.map((txn) => (
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
