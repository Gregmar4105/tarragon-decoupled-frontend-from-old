import { Head, router } from '@inertiajs/react';
import { format, subDays } from 'date-fns';
import { Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { DailyBookingsChart } from '@/components/DailyBookingsChart';
import { DateRangePicker } from '@/components/DateRangePicker';
import { SourcePieChart } from '@/components/SourcePieChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Props {
    dailyTrend: Array<{ name: string; bookings: number }>;
    sourceDistribution: Array<{ name: string; value: number }>;
}

export default function Reports({ dailyTrend, sourceDistribution }: Props) {
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/reports' }]}>
            <Head title="Reports & Analytics" />

            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground mt-1">
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
                            <Download className="w-4 h-4" /> Export Report
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="overflow-hidden w-full">
                        <CardHeader>
                            <CardTitle>Daily Bookings Trend</CardTitle>
                            <CardDescription>Number of bags stored per day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DailyBookingsChart data={dailyTrend} />
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden w-full">
                        <CardHeader>
                            <CardTitle>Booking Sources</CardTitle>
                            <CardDescription>Where your customers are coming from</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SourcePieChart data={sourceDistribution} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
