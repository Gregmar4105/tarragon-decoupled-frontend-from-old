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
            <DialogContent className="max-w-[950px] w-full sm:max-w-[950px] p-0 gap-0 overflow-hidden sm:rounded-2xl bg-white dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800 transition-all duration-200">
                <DialogHeader className="p-8 pb-2 border-b border-transparent">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Customer Booking</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row text-left">
                    {/* Left Column - Form */}
                    <div className="flex-[1.4] p-8 pt-6 space-y-8">
                        {/* Drop-off */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Drop-off</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-[1.5]">
                                    <Input
                                        type="date"
                                        className="h-11 pl-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-offset-0 focus-visible:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-400 font-medium transition-all hover:border-blue-400/50"
                                        value={dates.dropoffDate}
                                        onChange={(e) => updateDate('dropoffDate', e.target.value)}
                                    />
                                    <Calendar className="absolute left-4 top-3 h-5 w-5 text-blue-500 pointer-events-none" />
                                </div>
                                <div className="flex-1">
                                    <Select onValueChange={(v) => updateDate('dropoffTime', v)}>
                                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-0 focus:ring-offset-0 relative transition-all hover:border-blue-400/50">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-gray-400 dark:text-gray-500"><svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0C3.35786 0 0 3.35786 0 7.5C0 11.6421 3.35786 15 7.5 15C11.6421 15 15 11.6421 15 7.5C15 3.35786 11.6421 0 7.5 0ZM7.5 1.25C10.9518 1.25 13.75 4.04822 13.75 7.5C13.75 10.9518 10.9518 13.75 7.5 13.75C4.04822 13.75 1.25 10.9518 1.25 7.5C1.25 4.04822 4.04822 1.25 7.5 1.25ZM8.125 3.75C8.125 3.40482 7.84518 3.125 7.5 3.125C7.15482 3.125 6.875 3.40482 6.875 3.75V7.29289L4.65901 9.50888C4.41493 9.75296 4.41493 10.1487 4.65901 10.3928C4.90308 10.6368 5.29881 10.6368 5.54289 10.3928L8.125 7.81066V3.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></span>
                                                <SelectValue placeholder="Time (am)" />
                                            </div>
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
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Pick-up</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-[1.5]">
                                    <Input
                                        type="date"
                                        className="h-11 pl-11 rounded-xl border-gray-200 bg-white text-gray-900 focus-visible:ring-offset-0 focus-visible:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-400 font-medium transition-all hover:border-blue-400/50"
                                        value={dates.pickupDate}
                                        onChange={(e) => updateDate('pickupDate', e.target.value)}
                                    />
                                    <Calendar className="absolute left-4 top-3 h-5 w-5 text-blue-500 pointer-events-none" />
                                </div>
                                <div className="flex-1">
                                    <Select onValueChange={(v) => updateDate('pickupTime', v)}>
                                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-0 focus:ring-offset-0 relative transition-all hover:border-blue-400/50">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-gray-400 dark:text-gray-500"><svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0C3.35786 0 0 3.35786 0 7.5C0 11.6421 3.35786 15 7.5 15C11.6421 15 15 11.6421 15 7.5C15 3.35786 11.6421 0 7.5 0ZM7.5 1.25C10.9518 1.25 13.75 4.04822 13.75 7.5C13.75 10.9518 10.9518 13.75 7.5 13.75C4.04822 13.75 1.25 10.9518 1.25 7.5C1.25 4.04822 4.04822 1.25 7.5 1.25ZM8.125 3.75C8.125 3.40482 7.84518 3.125 7.5 3.125C7.15482 3.125 6.875 3.40482 6.875 3.75V7.29289L4.65901 9.50888C4.41493 9.75296 4.41493 10.1487 4.65901 10.3928C4.90308 10.6368 5.29881 10.6368 5.54289 10.3928L8.125 7.81066V3.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></span>
                                                <SelectValue placeholder="Time (am)" />
                                            </div>
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
                            <label className="text-sm font-semibold text-gray-700 block mb-5 dark:text-gray-300 ml-1">Bag Counter</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-3 dark:text-gray-400">Small</span>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-200 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm" onClick={() => updateCount('small', -1)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-5 text-center text-lg font-semibold dark:text-white tabular-nums">{counts.small}</span>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-200 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm" onClick={() => updateCount('small', 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-3 dark:text-gray-400">Medium</span>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-200 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm" onClick={() => updateCount('medium', -1)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-5 text-center text-lg font-semibold dark:text-white tabular-nums">{counts.medium}</span>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-200 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm" onClick={() => updateCount('medium', 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-3 dark:text-gray-400">Large</span>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-200 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm" onClick={() => updateCount('large', -1)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-5 text-center text-lg font-semibold dark:text-white tabular-nums">{counts.large}</span>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-200 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm" onClick={() => updateCount('large', 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="w-full lg:w-[350px] bg-gray-50/50 dark:bg-zinc-900/30 border-t lg:border-t-0 lg:border-l border-dashed border-gray-200 dark:border-zinc-800 p-8 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-8 dark:text-white">Order Summary</h3>

                        <div className="space-y-6 flex-1">
                            <div className="flex justify-between items-start text-sm group">
                                <span className="text-gray-500 font-medium dark:text-gray-400">Drop-off</span>
                                <div className="text-right">
                                    <span className="block font-semibold text-gray-900 dark:text-gray-200">
                                        {dates.dropoffDate ? new Date(dates.dropoffDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                    </span>
                                    <span className="block text-gray-500 dark:text-gray-500 text-xs mt-0.5 min-h-[1rem]">
                                        {dates.dropoffTime || ''}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-start text-sm group">
                                <span className="text-gray-500 font-medium dark:text-gray-400">Pick-up</span>
                                <div className="text-right">
                                    <span className="block font-semibold text-gray-900 dark:text-gray-200">
                                        {dates.pickupDate ? new Date(dates.pickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                    </span>
                                    <span className="block text-gray-500 dark:text-gray-500 text-xs mt-0.5 min-h-[1rem]">
                                        {dates.pickupTime || ''}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-200/50 border-dashed dark:border-zinc-800">
                                <span className="text-gray-500 font-medium dark:text-gray-400">Total Bags</span>
                                <span className="font-bold text-gray-900 text-base dark:text-gray-200">{counts.small + counts.medium + counts.large}</span>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-200/50 dark:border-zinc-800">
                            <div className="flex justify-between items-end mb-6">
                                <span className="font-bold text-lg text-gray-900 dark:text-white">Subtotal</span>
                                <div className="text-right">
                                    <span className="font-extrabold text-2xl text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button className="w-full bg-[#0066FF] hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 h-12 rounded-xl text-md font-semibold transition-all duration-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white">
                                Book Now
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
