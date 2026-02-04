import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyBookingsChart } from '@/components/DailyBookingsChart';
import { SourcePieChart } from '@/components/SourcePieChart';
import { Calendar, Download } from 'lucide-react';

export default function Reports() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/reports' }]}>
            <Head title="Reports & Analytics" />

            <div className="flex h-full flex-1 flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground mt-1">
                            Performance metrics for the last 30 days.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Calendar className="w-4 h-4" /> Last 30 Days
                        </Button>
                        <Button className="gap-2 bg-blue-600">
                            <Download className="w-4 h-4" /> Export Report
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Bookings Trend</CardTitle>
                            <CardDescription>Number of bags stored per day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DailyBookingsChart />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Sources</CardTitle>
                            <CardDescription>Where your customers are coming from</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SourcePieChart />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
