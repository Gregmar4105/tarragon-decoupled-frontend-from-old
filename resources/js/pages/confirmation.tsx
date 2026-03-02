import { Head, Link } from '@inertiajs/react';
import { CheckCircle, MapPin, Calendar, Package, Printer, Share2, ArrowRight } from 'lucide-react';
import QRCode from "react-qr-code";
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/context/CurrencyContext';

export default function Confirmation({ bookingId }: { bookingId?: string }) {
    const { format } = useCurrency();

    // Mock data if no ID provided or for display
    const booking = {
        id: bookingId || "BK800000001",
        customer: "Guest User",
        dropoff: "Today, 10:00 AM",
        pickup: "Today, 6:00 PM",
        bags: 3,
        total: 35,
        location: "Tarragon Corner, Pasay City"
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <Head title="Booking Confirmed - Tarragon Manila" />
            <Navbar />

            <main className="flex-1 py-12 px-4 md:px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                        <div className="bg-green-600 p-8 text-center text-white">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full text-green-600 mb-4 shadow-lg">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                            <p className="text-green-100">Your space is reserved. We've sent an email to you.</p>
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Left: Details */}
                                <div className="flex-1 space-y-8">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Booking Reference</p>
                                        <p className="text-3xl font-mono font-bold text-gray-900">{booking.id}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Drop-off</p>
                                                <p className="text-gray-600">{booking.dropoff}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Pick-up</p>
                                                <p className="text-gray-600">{booking.pickup}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Location</p>
                                                <p className="text-gray-600">{booking.location}</p>
                                                <a href="#" className="text-sm text-blue-600 font-medium hover:underline">Get Directions</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex gap-4">
                                        <Button variant="outline" className="flex-1 gap-2">
                                            <Printer className="w-4 h-4" /> Print
                                        </Button>
                                        <Button variant="outline" className="flex-1 gap-2">
                                            <Share2 className="w-4 h-4" /> Share
                                        </Button>
                                    </div>
                                </div>

                                {/* Right: QR Code */}
                                <div className="w-full md:w-64 flex flex-col items-center">
                                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 mb-4">
                                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                                            <QRCode value={booking.id} size={180} />
                                        </div>
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mb-6">
                                        Show this QR code to our staff when you arrive to drop off your bags.
                                    </p>
                                    <div className="w-full bg-blue-50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Paid</p>
                                        <p className="text-2xl font-extrabold text-blue-600">{format(booking.total)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/track">
                            <Button variant="link" className="text-gray-500 hover:text-gray-900">
                                Track or Modify Booking <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
