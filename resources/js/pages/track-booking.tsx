import { Head, Link } from '@inertiajs/react';
import { Search, Package, Clock, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TrackBooking() {
    const [bookingId, setBookingId] = useState('');
    const [status, setStatus] = useState<'idle' | 'found' | 'not-found'>('idle');
    const [bookingData, setBookingData] = useState<any>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock lookup logic
        if (bookingId.trim().length > 0) {
            setStatus('found');
            setBookingData({
                id: bookingId.toUpperCase(),
                customer: "Guest User",
                checkIn: "2024-02-05 10:00 AM",
                bagCount: 3,
                status: "Stored",
                location: "Tarragon Corner"
            });
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            <Head title="Track Booking - Tarragon Manila" />
            <Navbar />

            <main className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-4 py-20">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Track Your Storage</h1>
                        <p className="mt-2 text-gray-600">Enter your booking reference or email address.</p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="e.g. BK800000001"
                                        className="pl-10 h-11"
                                        value={bookingId}
                                        onChange={(e) => setBookingId(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full bg-orange-500 hover:bg-orange-600 shadow-md text-white font-bold h-11 transition-all" type="submit">
                                    Find Booking
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {status === 'found' && bookingData && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-green-50 p-4 border-b border-green-100 flex items-center gap-3">
                                <CheckCircle className="text-green-600 w-5 h-5" />
                                <div>
                                    <p className="font-bold text-green-900">Booking Found</p>
                                    <p className="text-xs text-green-700">Reference: {bookingData.id}</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Package className="w-5 h-5" />
                                        <span>Items Stored</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{bookingData.bagCount} Bags</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Clock className="w-5 h-5" />
                                        <span>Check-in Time</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{bookingData.checkIn}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span>Status</span>
                                    </div>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">{bookingData.status}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="w-5 h-5" />
                                        <span>Location</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{bookingData.location}</span>
                                </div>

                                <div className="pt-4">
                                    <Button variant="outline" className="w-full">View Full Receipt</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
