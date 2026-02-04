import { Head, Link } from '@inertiajs/react'; // added Link
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, CreditCard, User, Camera, Plus, ArrowLeft, AlertTriangle, ShieldCheck, Clock, Banknote, Tag } from 'lucide-react'; // Added icons
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrency } from '@/context/CurrencyContext';

const breadcrumbs = [
    {
        title: 'Bookings',
        href: '/bookings',
    },
    {
        title: 'Walk-in Booking',
        href: '/bookings/create',
    },
];

export default function BookingsCreate() {
    const { format } = useCurrency();
    const [paymentTiming, setPaymentTiming] = useState<'check-in' | 'check-out'>('check-in');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Walk-in Booking" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/bookings" className="text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">Walk-in Booking</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Create a new booking for a walk-in customer.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Customer Details */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                            <CardDescription>Enter the customer's information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first-name">First Name</Label>
                                    <Input id="first-name" placeholder="First Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last-name">Last Name</Label>
                                    <Input id="last-name" placeholder="Last Name" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="email@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" placeholder="+63 900 000 0000" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Summary & Payment */}
                    <Card className="lg:row-span-2 shadow-sm border-gray-200 flex flex-col h-full">
                        <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/40">
                            <CardTitle className="text-lg font-semibold tracking-tight text-gray-900">Booking Summary</CardTitle>
                            <CardDescription className="text-gray-500">Review details and confirm payment.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6 flex-1 flex flex-col">
                            <div className="space-y-4 flex-1">
                                <div className="flex justify-between items-center text-sm py-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>Duration</span>
                                    </div>
                                    <span className="font-semibold text-foreground">24 Hours</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Package className="w-4 h-4" />
                                        <span>Bags (x2)</span>
                                    </div>
                                    <span className="font-semibold text-foreground">{format(10)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Insurance</span>
                                    </div>
                                    <span className="font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full text-xs">Included</span>
                                </div>

                                <div className="my-6 border-t border-dashed border-gray-200" />

                                <div className="flex justify-between items-end">
                                    <span className="font-semibold text-lg text-muted-foreground">Total</span>
                                    <span className="font-bold text-4xl text-blue-700 tracking-tight">{format(10)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-gray-700">Payment Collection</Label>
                                    <div className="flex gap-4">
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentTiming('check-in')}>
                                            <Checkbox id="pay-check-in" checked={paymentTiming === 'check-in'} onCheckedChange={() => setPaymentTiming('check-in')} />
                                            <Label htmlFor="pay-check-in" className="cursor-pointer font-normal">Pay at Check-in</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentTiming('check-out')}>
                                            <Checkbox id="pay-check-out" checked={paymentTiming === 'check-out'} onCheckedChange={() => setPaymentTiming('check-out')} />
                                            <Label htmlFor="pay-check-out" className="cursor-pointer font-normal">Pay at Check-out</Label>
                                        </div>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full font-bold h-12 text-base shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:translate-y-[-1px]">
                                    Confirm Booking
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Baggage Details */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Baggage Details</CardTitle>
                            <CardDescription>Log the items being stored.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <Label>Baggage Quantities</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Small</label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" min="0" placeholder="0" className="bg-white" />
                                            <span className="text-xs text-muted-foreground hidden lg:inline">Cabin</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medium</label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" min="0" placeholder="0" className="bg-white" />
                                            <span className="text-xs text-muted-foreground hidden lg:inline">Check-in</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Large</label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" min="0" placeholder="0" className="bg-white" />
                                            <span className="text-xs text-muted-foreground hidden lg:inline">Oversize</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Drop-off Time</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="datetime-local" className="pl-9" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Pick-up Time</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input type="datetime-local" className="pl-9" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tag Number</Label>
                                <div className="relative">
                                    <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="e.g. A-123" className="pl-9" />
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-gray-50/80 hover:border-blue-400 cursor-pointer transition-all group">
                                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                                    <Camera className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-900">Take Bag Photo</p>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Capture visual proof of the bag's condition before storage.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
function InfoIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
