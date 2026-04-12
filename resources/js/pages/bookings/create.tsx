import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react'; // Add inertial router for posting data
import { Calendar, Package, CreditCard, User, Camera, Plus, ArrowLeft, AlertTriangle, ShieldCheck, Clock, Banknote, Tag, CheckCircle, X } from 'lucide-react'; // Added icons
import { useState, useMemo, useRef } from 'react';
import QRCode from "react-qr-code";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/context/CurrencyContext';
import AppLayout from '@/layouts/app-layout';
import CameraModal from '@/components/CameraModal';

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
    const [successData, setSuccessData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, transform } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bags: { small: 0, medium: 0, large: 0, plus: 0 },
        dropOffTime: '',
        pickUpTime: '',
        tagNumber: '',
        images: [] as File[],
    });

    // Computed Values
    const totalBags = data.bags.small + data.bags.medium + data.bags.large + data.bags.plus;
    const PRICES = props.pricing || { small: 5, medium: 10, large: 15, plus: 25 };

    const computeDurationAndPrice = useMemo(() => {
        if (!data.dropOffTime || !data.pickUpTime) return { hours: 0, price: 0 };

        const start = new Date(data.dropOffTime).getTime();
        const end = new Date(data.pickUpTime).getTime();

        if (start >= end || isNaN(start) || isNaN(end)) return { hours: 0, price: 0 };

        const hoursTotal = Math.ceil((end - start) / (1000 * 60 * 60)); // Round up to nearest hour

        const baseRate = (data.bags.small * (PRICES.small)) +
            (data.bags.medium * (PRICES.medium)) +
            (data.bags.large * (PRICES.large)) +
            (data.bags.plus * (PRICES.plus));
        const dailyRatePeriods = Math.ceil(hoursTotal / 24) || 1; // Ensure at least 1 day if hours < 24
        const price = baseRate * dailyRatePeriods;

        return { hours: hoursTotal, price };
    }, [data.dropOffTime, data.pickUpTime, data.bags, PRICES]);

    const { hours, price } = computeDurationAndPrice;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('images', [...data.images, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removePhoto = (index: number) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleCameraPhotos = (files: File[]) => {
        setData('images', [...data.images, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setIsCameraOpen(false);
    };

    // Transform data for backend
    transform((data) => ({
        customer_name: `${data.firstName} ${data.lastName}`.trim(),
        customer_email: data.email,
        customer_phone: data.phone,
        drop_off_time: data.dropOffTime,
        pick_up_time: data.pickUpTime,
        total_price: price,
        tag_number: data.tagNumber,
        images: data.images,
        items: data.bags,
        source: 'admin',
    }));

    const submitBooking = () => {
        if (!data.firstName || !data.email || !data.dropOffTime || !data.pickUpTime || totalBags === 0) {
            alert('Please fill out the required core details and add at least one bag.');
            return;
        }

        post('/bookings', {
            forceFormData: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.successBookingId) {
                    setSuccessData({
                        id: flash.successBookingId,
                        customer: `${data.firstName} ${data.lastName}`.trim() || data.email,
                        dropoff: data.dropOffTime,
                        pickup: data.pickUpTime,
                        bags: totalBags,
                        total: price
                    });
                }
                reset();
                setPreviews([]);
            },
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
                                                <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Drop-off</p>
                                                    <p className="text-gray-600">{new Date(successData.dropoff).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Pick-up</p>
                                                    <p className="text-gray-600">{new Date(successData.pickup).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
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
                                        <div className="w-full bg-orange-50 p-4 rounded-xl text-center">
                                            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Total Due</p>
                                            <p className="text-2xl font-extrabold text-orange-600">{format(successData.total)}</p>
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
                                        <Input id="first-name" placeholder="First Name" value={data.firstName} onChange={e => setData('firstName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last Name</Label>
                                        <Input id="last-name" placeholder="Last Name" value={data.lastName} onChange={e => setData('lastName', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="email@example.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="+63 900 000 0000" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Booking Summary & Payment */}
                        <Card className="lg:row-span-2 shadow-sm border-gray-200 flex flex-col h-full order-last lg:order-none">
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
                                        <span className="font-bold text-4xl text-orange-600 tracking-tight">{format(price)}</span>
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

                                    <Button size="lg" className="w-full font-bold h-12 text-base shadow-lg shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 text-white transition-all hover:translate-y-[-1px]" onClick={submitBooking} disabled={processing || price === 0}>
                                        {processing ? 'Confirming...' : 'Confirm Booking'}
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
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Small</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" placeholder="0" className="bg-white" value={data.bags.small || ''} onChange={e => setData('bags', { ...data.bags, small: parseInt(e.target.value) || 0 })} />
                                                <span className="text-xs text-muted-foreground hidden lg:inline">Cabin</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medium</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" placeholder="0" className="bg-white" value={data.bags.medium || ''} onChange={e => setData('bags', { ...data.bags, medium: parseInt(e.target.value) || 0 })} />
                                                <span className="text-xs text-muted-foreground hidden lg:inline">Check-in</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Large</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" placeholder="0" className="bg-white" value={data.bags.large || ''} onChange={e => setData('bags', { ...data.bags, large: parseInt(e.target.value) || 0 })} />
                                                <span className="text-xs text-muted-foreground hidden lg:inline">Oversize</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 border rounded-lg p-3 bg-gray-50/50">
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Plus Size</label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" placeholder="0" className="bg-white" value={data.bags.plus || ''} onChange={e => setData('bags', { ...data.bags, plus: parseInt(e.target.value) || 0 })} />
                                                <span className="text-xs text-muted-foreground hidden lg:inline">Surf/Golf</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Drop-off Time</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="datetime-local" className="pl-9" value={data.dropOffTime} onChange={e => setData('dropOffTime', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pick-up Time</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="datetime-local" className="pl-9" value={data.pickUpTime} onChange={e => setData('pickUpTime', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tag Number</Label>
                                    <div className="relative">
                                        <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="e.g. A-123" className="pl-9" value={data.tagNumber} onChange={e => setData('tagNumber', e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Baggage Photos</Label>
                                    
                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                    <button 
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition-all"
                                            >
                                                <Plus className="w-6 h-6 text-gray-400" />
                                            </div>
                                        </div>
                                    )}

                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={handlePhotoChange} 
                                    />

                                    {previews.length === 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-gray-50/80 hover:border-orange-400 cursor-pointer transition-all group"
                                            >
                                                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-orange-100 transition-colors">
                                                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-orange-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-gray-900">Upload Photos</p>
                                                    <p className="text-sm text-muted-foreground">Select images from device.</p>
                                                </div>
                                            </div>

                                            <div 
                                                onClick={() => setIsCameraOpen(true)}
                                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-gray-50/80 hover:border-orange-400 cursor-pointer transition-all group"
                                            >
                                                <div className="bg-gray-100 p-3 rounded-full group-hover:bg-orange-100 transition-colors">
                                                    <Camera className="w-6 h-6 text-gray-500 group-hover:text-orange-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-gray-900">Live Camera</p>
                                                    <p className="text-sm text-muted-foreground">Take photos now.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <CameraModal 
                isOpen={isCameraOpen} 
                onClose={() => setIsCameraOpen(false)} 
                onPhotosCaptured={handleCameraPhotos} 
            />
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
