import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Banknote, Lock, ShieldCheck } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function Checkout() {
    const { format } = useCurrency();
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Head title="Checkout" />
            <Navbar />

            <main className="flex-1 py-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/search" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Booking Forms */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Details</CardTitle>
                                    <CardDescription>We'll send your booking confirmation here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input placeholder="john@example.com" type="email" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <Input placeholder="+1 234 567 8900" type="tel" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                    <CardDescription>Payment is collected in person.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 border rounded-xl flex items-center gap-4 bg-green-50 border-green-200">
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <Banknote className="w-6 h-6 text-green-700" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Cash Payment Only</p>
                                            <p className="text-sm text-gray-500">Please pay at the counter upon check-in or check-out.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button size="lg" className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700">
                                Confirm and Pay {format(10)}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Lock className="w-4 h-4" />
                                Secure SSL Encryption
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
                                <h2 className="font-bold text-lg mb-6">Booking Summary</h2>

                                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-gray-400">IMG</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Pasay City Central</h3>
                                        <p className="text-sm text-gray-500">Luggage Storage</p>
                                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-green-600">
                                            <ShieldCheck className="w-3 h-3" />
                                            Insured
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 text-sm mb-6 border-b border-gray-100 pb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Check-in</span>
                                        <span className="font-medium">Today, 10:00 AM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Check-out</span>
                                        <span className="font-medium">Today, 06:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Items</span>
                                        <span className="font-medium">2 Bags</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">{format(10)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Insurance</span>
                                        <span>Free</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-2xl text-blue-600">{format(10)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
