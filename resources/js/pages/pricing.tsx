import { Head } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck, Clock, Calendar, HelpCircle } from 'lucide-react';
import BookingModal from "@/components/BookingModal";
import { useCurrency } from '@/context/CurrencyContext';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function Pricing() {
    const { format } = useCurrency();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            <Head title="Pricing - Tarragon Manila" />
            <Navbar />

            <main className="flex-1">
                {/* Hero */}
                <div className="bg-[#F8FAFC] py-20 px-6 lg:px-12 text-center">
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        No hidden fees. No complicated tiers. Just secure storage for your luggage.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-10 mb-24 relative z-10">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Hourly */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Clock className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Hourly Rate</h3>
                            <p className="text-gray-500 mb-6">Perfect for short layovers</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-gray-900">$2.00</span>
                                <span className="text-gray-500 font-medium">/hour/bag</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>{format(750)} Insurance included</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>24/7 CCTV Monitoring</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Secure Tamper-proof Seals</span>
                                </li>
                            </ul>
                            <BookingModal>
                                <Button className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold h-12 rounded-xl">
                                    Book Hourly
                                </Button>
                            </BookingModal>
                        </div>

                        {/* Daily - Best Value */}
                        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl shadow-2xl shadow-orange-200 border border-orange-400 p-8 flex flex-col relative overflow-hidden transform scale-105 z-10">
                            <div className="absolute top-0 inset-x-0 bg-yellow-400/50 py-1 text-center text-xs font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                                Most Popular
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Calendar className="w-32 h-32 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 mt-4">Daily Rate</h3>
                            <p className="text-orange-50 mb-6">Best value for day trips</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-white">$5.00</span>
                                <span className="text-orange-100 font-medium">/day/bag</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 text-orange-50">
                                <li className="flex items-center gap-3 text-sm">
                                    <div className="bg-white/20 p-1 rounded-full"><Check className="w-3 h-3 text-white" /></div>
                                    <span>{format(1500)} Insurance included</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <div className="bg-white/20 p-1 rounded-full"><Check className="w-3 h-3 text-white" /></div>
                                    <span>24/7 access & security</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <div className="bg-white/20 p-1 rounded-full"><Check className="w-3 h-3 text-white" /></div>
                                    <span>Free Cancellation</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <div className="bg-white/20 p-1 rounded-full"><Check className="w-3 h-3 text-white" /></div>
                                    <span>Any bag size</span>
                                </li>
                            </ul>
                            <BookingModal>
                                <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold h-12 rounded-xl shadow-lg">
                                    Book Daily
                                </Button>
                            </BookingModal>
                        </div>

                        {/* Long Term */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <ShieldCheck className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Long Term</h3>
                            <p className="text-gray-500 mb-6">For extended stays</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-gray-900">$3.50</span>
                                <span className="text-gray-500 font-medium">/day/bag</span>
                            </div>
                            <p className="text-xs text-gray-400 -mt-4 mb-6">*When booking 7+ days</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Premium Insurance ({format(3000)})</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Dedicated storage area</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Priority support</span>
                                </li>
                            </ul>
                            <BookingModal>
                                <Button className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold h-12 rounded-xl">
                                    Email for Quote
                                </Button>
                            </BookingModal>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto px-6 mb-24">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <HelpCircle className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Is there a size limit for bags?</AccordionTrigger>
                            <AccordionContent>
                                No! We accept all sizes of luggage, including sports equipment like golf clubs, surfboards, and bicycles. Large items may be subject to availability, so we recommend booking ahead.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Is my luggage insured?</AccordionTrigger>
                            <AccordionContent>
                                Yes. Every booking includes our protection guarantee. Hourly bookings are covered up to {format(750)}, and daily bookings are covered up to {format(1500)} per item against loss, theft, or damage.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I cancel my booking?</AccordionTrigger>
                            <AccordionContent>
                                Absolutely. You can cancel your booking for free any time before your scheduled drop-off time for a full refund.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Do I need to print my booking?</AccordionTrigger>
                            <AccordionContent>
                                No printing needed! Just show your QR code confirmation email on your phone when you arrive at our Tarragon Corner location.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </main>

            <Footer />
        </div>
    );
}
