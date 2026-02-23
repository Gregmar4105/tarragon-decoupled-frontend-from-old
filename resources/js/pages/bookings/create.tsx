import { Head, Link, usePage } from '@inertiajs/react';
import QRCode from "react-qr-code";
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, CreditCard, User, Camera, Plus, ArrowLeft, AlertTriangle, ShieldCheck, Clock, Banknote, Tag, CheckCircle } from 'lucide-react'; // Added icons
import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrency } from '@/context/CurrencyContext';
import { router } from '@inertiajs/react'; // Add inertial router for posting data

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
    const { props } = usePage() as any;
    const [paymentTiming, setPaymentTiming] = useState<'check-in' | 'check-out'>('check-in');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Customer State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Bags State
    const [bags, setBags] = useState({ small: 0, medium: 0, large: 0 });

    // Dates State
    const [dropOffTime, setDropOffTime] = useState('');
    const [pickUpTime, setPickUpTime] = useState('');

    const [tagNumber, setTagNumber] = useState('');

    // Computed Values
    const totalBags = bags.small + bags.medium + bags.large;

    const computeDurationAndPrice = useMemo(() => {
        if (!dropOffTime || !pickUpTime) return { hours: 0, price: 0 };

        const start = new Date(dropOffTime).getTime();
        const end = new Date(pickUpTime).getTime();

        if (start >= end) return { hours: 0, price: 0 };

        const hours = Math.ceil((end - start) / (1000 * 60 * 60)); // Round up to nearest hour

        // Simple logic: Base is $10/bag/24hrs for all types 
        // Can be separated if needed for medium/large specifics later
        const baseRate = 10;
        const dailyRatePeriods = Math.ceil(hours / 24);
        const price = totalBags * baseRate * dailyRatePeriods;

        return { hours, price };
    }, [dropOffTime, pickUpTime, totalBags]);

    const { hours, price } = computeDurationAndPrice;

    const handleConfirmBooking = () => {
        if (!firstName || !email || !dropOffTime || !pickUpTime || totalBags === 0) {
            alert('Please fill out the required core details and add at least one bag.');
            return;
        }

        setIsSubmitting(true);
        router.post('/bookings', {
            customer_name: `${firstName} ${lastName}`.trim(),
            customer_email: email,
            customer_phone: phone,
            drop_off_time: dropOffTime,
            pick_up_time: pickUpTime,
            total_price: price,
            items: bags,
            source: 'admin',
        }, {
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.successBookingId) {
                    setSuccessData({
                        id: flash.successBookingId,
                        customer: `${firstName} ${lastName}`.trim() || email,
                        dropoff: dropOffTime,
                        pickup: pickUpTime,
                        bags: totalBags,
                        total: price
                    });
                } else {
                    alert('Walk-in Booking created successfully!');
                }

                setFirstName('');
                setLastName('');
                setEmail('');
                setPhone('');
                setDropOffTime('');
                setPickUpTime('');
                setBags({ small: 0, medium: 0, large: 0 });
                setTagNumber('');
            },
            onFinish: () => setIsSubmitting(false),
            onError: (errors) => {
                console.error("Booking failed:", errors);
                alert("Failed to process the booking.");
            }
        });
    };

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

                {successData ? (
                    <div className="max-w-3xl mx-auto w-full mt-8 animate-in fade-in zoom-in duration-300">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                            <div className="bg-green-600 p-8 text-center text-white">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full text-green-600 mb-4 shadow-lg">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                                <p className="text-green-100">The walk-in booking was successfully created.</p>
                            </div>

                            <div className="p-8 md:p-12">
                                <div className="flex flex-col md:flex-row gap-12">
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Booking Reference</p>
                                            <p className="text-3xl font-mono font-bold text-gray-900">{successData.id}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Drop-off</p>
                                                    <p className="text-gray-600">{new Date(successData.dropoff).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Pick-up</p>
                                                    <p className="text-gray-600">{new Date(successData.pickup).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Items</p>
                                                    <p className="text-gray-600">{successData.bags} Bags</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-64 flex flex-col items-center">
                                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 mb-4">
                                            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                                                <QRCode value={successData.id} size={180} />
                                            </div>
                                        </div>
                                        <div className="w-full bg-blue-50 p-4 rounded-xl text-center">
                                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Due</p>
                                            <p className="text-2xl font-extrabold text-blue-600">{format(successData.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <Button size="lg" onClick={() => setSuccessData(null)}>
                                Create Another Booking
                            </Button>
                        </div>
                    </div>
                ) : (
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
                                        <Input id="first-name" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last Name</Label>
                                        <Input id="last-name" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="+63 900 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
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
                                        <span className="font-semibold text-foreground">{hours > 0 ? `${hours} Hours` : '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Package className="w-4 h-4" />
                                            <span>Bags (x{totalBags})</span>
                                        </div>
                                        <span className="font-semibold text-foreground">{price > 0 ? format(price) : '-'}</span>
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
                                        <span className="font-bold text-4xl text-blue-700 tracking-tight">{format(price)}</span>
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

                                    <Button size="lg" className="w-full font-bold h-12 text-base shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white transition-all hover:translate-y-[-1px]" onClick={handleConfirmBooking} disabled={isSubmitting || price === 0}>
                                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
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
                                                <Input type="number" min="0" placeholder="0" className="bg-white" value={bags.small || ''} onChange={e => setBags(b => ({ ...b, small: parseInt(e.target.value) || 0 }))} />
                                                <span className="text-xs text-muted-foreground hidden lg:inline">Cabin</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medium</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" placeholder="0" className="bg-white" value={bags.medium || ''} onChange={e => setBags(b => ({ ...b, medium: parseInt(e.target.value) || 0 }))} />
                                                <span className="text-xs text-muted-foreground hidden lg:inline">Check-in</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Large</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" placeholder="0" className="bg-white" value={bags.large || ''} onChange={e => setBags(b => ({ ...b, large: parseInt(e.target.value) || 0 }))} />
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
                                            <Input type="datetime-local" className="pl-9" value={dropOffTime} onChange={e => setDropOffTime(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pick-up Time</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="datetime-local" className="pl-9" value={pickUpTime} onChange={e => setPickUpTime(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tag Number</Label>
                                    <div className="relative">
                                        <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="e.g. A-123" className="pl-9" value={tagNumber} onChange={e => setTagNumber(e.target.value)} />
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
                )}
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
