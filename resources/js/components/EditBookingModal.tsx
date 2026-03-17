import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/context/CurrencyContext';

interface BookingInterface {
    id: string;
    customer: string;
    contact: string;
    bags: Record<string, number>;
    amount: number;
    status: string;
    source: string;
    checkIn: string;
    checkOut: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    booking: BookingInterface | null;
}

export function EditBookingModal({ isOpen, onClose, booking }: Props) {
    const { format } = useCurrency();

    // Parse the Inertia formatted dates back to html input compatible strings (YYYY-MM-DDThh:mm)
    const formatForInput = (dateString?: string) => {
        if (!dateString) return '';
        // Date strings are formatted like '2023-11-20 10:30 AM'. We need a valid Date to get ISO.
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().slice(0, 16);
        } catch {
            return '';
        }
    };

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        customer_name: '',
        customer_phone: '',
        bags: {
            small: 0,
            medium: 0,
            large: 0,
            plus: 0
        },
        drop_off_time: '',
        pick_up_time: '',
        status: '',
        total_price: 0
    });

    useEffect(() => {
        if (booking) {
            setData({
                customer_name: booking.customer,
                customer_phone: booking.contact,
                bags: {
                    small: booking.bags.small || 0,
                    medium: booking.bags.medium || 0,
                    large: booking.bags.large || 0,
                    plus: booking.bags.plus || 0,
                },
                drop_off_time: formatForInput(booking.checkIn),
                pick_up_time: formatForInput(booking.checkOut),
                status: booking.status.toLowerCase(),
                total_price: booking.amount,
            });
            clearErrors();
        } else {
            reset();
        }
    }, [booking, isOpen]);

    // Simple recalculation mapping based on a standard plan (can be made dynamic)
    const recalculatePrice = (newBags: any) => {
        // Assume Standard Plan logic: 100 per bag
        const count = Object.values(newBags).reduce((sum, val) => (sum as number) + (Number(val) || 0), 0);
        return (count as number) * 100;
    };

    const handleBagChange = (type: 'small' | 'medium' | 'large' | 'plus', val: string) => {
        const num = parseInt(val) || 0;
        const newBags = { ...data.bags, [type]: num };
        setData(prev => ({
            ...prev,
            bags: newBags,
            total_price: recalculatePrice(newBags)
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;

        // The id from grid is the booking_reference
        put(`/bookings/${booking.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Booking successfully updated');
                onClose();
            },
            onError: (err) => {
                toast.error('Failed to update booking. Please check the inputs.');
                console.error(err);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Edit Booking {booking?.id}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer_name" className="text-right">Name</Label>
                            <Input
                                id="customer_name"
                                value={data.customer_name}
                                onChange={e => setData('customer_name', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.customer_name && <span className="col-span-4 text-xs text-red-500 text-right">{errors.customer_name}</span>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer_phone" className="text-right">Contact</Label>
                            <Input
                                id="customer_phone"
                                value={data.customer_phone}
                                onChange={e => setData('customer_phone', e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="drop_off_time" className="text-right">Check-in</Label>
                            <Input
                                type="datetime-local"
                                id="drop_off_time"
                                value={data.drop_off_time}
                                onChange={e => setData('drop_off_time', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.drop_off_time && <span className="col-span-4 text-xs text-red-500 text-right">{errors.drop_off_time}</span>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pick_up_time" className="text-right">Check-out</Label>
                            <Input
                                type="datetime-local"
                                id="pick_up_time"
                                value={data.pick_up_time}
                                onChange={e => setData('pick_up_time', e.target.value)}
                                className="col-span-3"
                            />
                            {errors.pick_up_time && <span className="col-span-4 text-xs text-red-500 text-right">{errors.pick_up_time}</span>}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Status</Label>
                            <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="checked-in">Checked-in</SelectItem>
                                    <SelectItem value="checked-out">Checked-out</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <span className="col-span-4 text-xs text-red-500 text-right">{errors.status}</span>}
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-3">Bags</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="small_bags" className="text-xs">Small</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        id="small_bags"
                                        value={data.bags.small}
                                        onChange={e => handleBagChange('small', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="medium_bags" className="text-xs">Medium</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        id="medium_bags"
                                        value={data.bags.medium}
                                        onChange={e => handleBagChange('medium', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="large_bags" className="text-xs">Large</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        id="large_bags"
                                        value={data.bags.large}
                                        onChange={e => handleBagChange('large', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="plus_bags" className="text-xs">Plus</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        id="plus_bags"
                                        value={data.bags.plus}
                                        onChange={e => handleBagChange('plus', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="items-center sm:justify-between">
                        <div className="font-semibold text-lg">Total: {format(data.total_price)}</div>
                        <Button type="submit" disabled={processing} className="bg-blue-600">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
