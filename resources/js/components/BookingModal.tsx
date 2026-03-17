import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Calendar, ArrowRight, ArrowLeft, CheckCircle, Package, User, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { router } from '@inertiajs/react';

export default function BookingModal({ children }: { children: React.ReactNode }) {
    const [step, setStep] = useState(1);
    const [counts, setCounts] = useState({ small: 0, medium: 1, large: 0 });
    const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [dates, setDates] = useState({
        dropoffDate: '',
        dropoffTime: '',
        pickupDate: '',
        pickupTime: ''
    });
    const [subtotal, setSubtotal] = useState(0);

    // Pricing Logic
    const PRICES = { small: 5, medium: 10, large: 15 };
    const { format, convert } = useCurrency();

    useEffect(() => {
        const total = (counts.small * PRICES.small) + (counts.medium * PRICES.medium) + (counts.large * PRICES.large);
        setSubtotal(total);
    }, [counts]);

    const updateCount = (type: keyof typeof counts, delta: number) => {
        setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
    };

    const updateDate = (field: keyof typeof dates, value: string) => {
        setDates(prev => ({ ...prev, [field]: value }));
    };

    const updateCustomer = (field: keyof typeof customer, value: string) => {
        setCustomer(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep(s => Math.min(3, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const handleBooking = () => {
        // Send actual payload to our new endpoint
        router.post('/bookings', {
            customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
            customer_email: customer.email,
            customer_phone: customer.phone,
            drop_off_time: `${dates.dropoffDate} ${dates.dropoffTime}`,
            pick_up_time: `${dates.pickupDate} ${dates.pickupTime}`,
            total_price: subtotal,
            items: counts
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[950px] w-full p-0 gap-0 overflow-hidden sm:rounded-2xl bg-white border-zinc-200 transition-all duration-200 max-h-[100dvh] sm:max-h-[85vh] flex flex-col">
                <DialogHeader className="p-4 md:p-6 border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="text-lg md:text-xl font-bold tracking-tight text-gray-900">
                        {step === 1 ? "Select Dates" : step === 2 ? "Add Bags" : "Customer Details"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mr-2 md:mr-8">
                        <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 w-4 md:w-8 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-100'}`} />
                        <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                        <div className={`h-1 w-4 md:w-8 rounded-full ${step === 3 ? 'bg-orange-500' : 'bg-gray-100'}`} />
                        <div className={`h-2 w-2 rounded-full ${step === 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                    </div>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row text-left flex-1 overflow-hidden">
                    {/* Left Column - Form */}
                    <div className="flex-1 p-4 md:p-8 overflow-y-auto">

                        {/* Step 1: Dates */}
                        {step === 1 && (
                            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-left-4 fade-in duration-300">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500" /> Drop-off
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input type="date" value={dates.dropoffDate} onChange={(e) => updateDate('dropoffDate', e.target.value)} className="h-12 w-full" />
                                        <Select onValueChange={(v) => updateDate('dropoffTime', v)}>
                                            <SelectTrigger className="h-12 w-full"><SelectValue placeholder="Time" /></SelectTrigger>
                                            <SelectContent>
                                                {['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'].map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500" /> Pick-up
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input type="date" value={dates.pickupDate} onChange={(e) => updateDate('pickupDate', e.target.value)} className="h-12 w-full" />
                                        <Select onValueChange={(v) => updateDate('pickupTime', v)}>
                                            <SelectTrigger className="h-12 w-full"><SelectValue placeholder="Time" /></SelectTrigger>
                                            <SelectContent>
                                                {['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'].map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Bags */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="space-y-4">
                                    {[
                                        { id: 'small', label: 'Small Bag', desc: 'Handbag, briefcase, backpack', price: PRICES.small },
                                        { id: 'medium', label: 'Medium Bag', desc: 'Carry-on suitcase, large backpack', price: PRICES.medium },
                                        { id: 'large', label: 'Large Bag', desc: 'Checked suitcase, equipment', price: PRICES.large }
                                    ].map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:border-orange-300 transition-colors bg-white gap-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{item.label}</p>
                                                <p className="text-sm text-gray-500">{item.desc}</p>
                                                <p className="text-orange-600 font-semibold mt-1">{format(item.price)}/day</p>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount(item.id as any, -1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center font-bold">{counts[item.id as keyof typeof counts]}</span>
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount(item.id as any, 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Customer */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input value={customer.firstName} onChange={e => updateCustomer('firstName', e.target.value)} placeholder="John" className="h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input value={customer.lastName} onChange={e => updateCustomer('lastName', e.target.value)} placeholder="Doe" className="h-12" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input value={customer.email} onChange={e => updateCustomer('email', e.target.value)} type="email" placeholder="john@example.com" className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <Input value={customer.phone} onChange={e => updateCustomer('phone', e.target.value)} type="tel" placeholder="+1 234 567 8900" className="h-12" />
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 flex gap-2">
                                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>Your booking includes {format(1500)} insurance coverage per bag. <strong>Cash payment only upon arrival.</strong></p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Summary */}
                    <div className="w-full lg:w-[320px] bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 md:p-8 flex flex-col justify-between shrink-0">
                        <div className="hidden lg:block">
                            <h3 className="font-bold text-gray-900 mb-6">Booking Summary</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Drop-off</span>
                                    <span className="font-medium text-right">
                                        {dates.dropoffDate ? new Date(dates.dropoffDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'} <br />
                                        <span className="text-xs text-gray-400">{dates.dropoffTime}</span>
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Pick-up</span>
                                    <span className="font-medium text-right">
                                        {dates.pickupDate ? new Date(dates.pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'} <br />
                                        <span className="text-xs text-gray-400">{dates.pickupTime}</span>
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between">
                                    <span className="text-gray-500">Total Bags</span>
                                    <span className="font-bold">{counts.small + counts.medium + counts.large}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Summary & Actions */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="lg:hidden text-xs text-muted-foreground">{counts.small + counts.medium + counts.large} items</span>
                                </div>
                                <span className="text-2xl font-extrabold text-orange-600">{format(subtotal)}</span>
                            </div>

                            <div className="flex gap-3">
                                {step > 1 && (
                                    <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                    </Button>
                                )}
                                {step < 3 ? (
                                    <Button onClick={nextStep} className="flex-[2] h-12 bg-orange-500 hover:bg-orange-600 font-bold">
                                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleBooking} className="flex-[2] h-12 bg-orange-500 hover:bg-orange-600 font-bold shadow-lg shadow-orange-200">
                                        Confirm Booking
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
