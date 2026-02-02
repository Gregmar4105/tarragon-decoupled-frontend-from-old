import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Calendar } from "lucide-react";
import { useState } from "react";

export default function BookingModal({ children }: { children: React.ReactNode }) {
    const [counts, setCounts] = useState({ small: 0, medium: 1, large: 0 });
    const [subtotal, setSubtotal] = useState(50.00); // Mock starting price

    const updateCount = (type: keyof typeof counts, delta: number) => {
        setCounts(prev => {
            const newCount = Math.max(0, prev[type] + delta);
            // Simple mock price update logic
            const priceDelta = delta * (type === 'small' ? 5 : type === 'medium' ? 10 : 15);
            setSubtotal(curr => Math.max(0, curr + priceDelta));
            return { ...prev, [type]: newCount };
        });
    };

    const [dates, setDates] = useState({
        dropoffDate: '',
        dropoffTime: '',
        pickupDate: '',
        pickupTime: ''
    });

    const updateDate = (field: keyof typeof dates, value: string) => {
        setDates(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[900px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">Customer Booking</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:flex-row">
                    {/* Left Column - Form */}
                    <div className="flex-1 p-6 pt-2 space-y-6">
                        {/* Drop-off */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Drop-off</label>
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Input
                                        type="date"
                                        className="pl-10"
                                        value={dates.dropoffDate}
                                        onChange={(e) => updateDate('dropoffDate', e.target.value)}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <Select onValueChange={(v) => updateDate('dropoffTime', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Time (am)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="9am">9:00 AM</SelectItem>
                                            <SelectItem value="10am">10:00 AM</SelectItem>
                                            <SelectItem value="11am">11:00 AM</SelectItem>
                                            <SelectItem value="12pm">12:00 PM</SelectItem>
                                            <SelectItem value="1pm">1:00 PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Pick-up */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Pick-up</label>
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Input
                                        type="date"
                                        className="pl-10"
                                        value={dates.pickupDate}
                                        onChange={(e) => updateDate('pickupDate', e.target.value)}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <Select onValueChange={(v) => updateDate('pickupTime', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Time (am)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="9am">9:00 AM</SelectItem>
                                            <SelectItem value="10am">10:00 AM</SelectItem>
                                            <SelectItem value="11am">11:00 AM</SelectItem>
                                            <SelectItem value="12pm">12:00 PM</SelectItem>
                                            <SelectItem value="1pm">1:00 PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Bag Counter */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-3">Bag Counter</label>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div>
                                    <span className="text-sm text-gray-600 block mb-2">Small Bags</span>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount('small', -1)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-4 text-center">{counts.small}</span>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount('small', 1)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block mb-2">Medium Bags</span>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount('medium', -1)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-4 text-center">{counts.medium}</span>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount('medium', 1)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block mb-2">Large Bags</span>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount('large', -1)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-4 text-center">{counts.large}</span>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateCount('large', 1)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="w-[320px] bg-gray-50 border-l border-gray-100 p-6 flex flex-col">
                        <h3 className="font-medium text-gray-900 mb-6">Order Summary</h3>

                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Drop-off</span>
                                <span className="font-medium">
                                    {dates.dropoffDate ? new Date(dates.dropoffDate).toLocaleDateString() : 'Select Date'}
                                    {dates.dropoffTime && ` - ${dates.dropoffTime}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pick-up</span>
                                <span className="font-medium">
                                    {dates.pickupDate ? new Date(dates.pickupDate).toLocaleDateString() : 'Select Date'}
                                    {dates.pickupTime && ` - ${dates.pickupTime}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Bags</span>
                                <span className="font-medium">{counts.small + counts.medium + counts.large}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-gray-900">Subtotal</span>
                                <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-full">
                                Book Now
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
