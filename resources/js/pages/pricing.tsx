import { Head } from '@inertiajs/react';
import { Check, ShieldCheck, Clock, Calendar, HelpCircle } from 'lucide-react';
import BookingModal from "@/components/BookingModal";
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/context/CurrencyContext';

export default function Pricing({ plans }: { plans: any[] }) {
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
                        {plans.map((plan: any) => (
                            <div key={plan.id} className={`rounded-3xl shadow-xl border p-8 flex flex-col relative overflow-hidden transform transition-transform duration-300 ${plan.is_popular ? 'bg-blue-600 shadow-blue-200 border-blue-500 scale-105 z-10' : 'bg-white border-gray-100 hover:-translate-y-1'}`}>
                                {plan.is_popular && (
                                    <div className="absolute top-0 inset-x-0 bg-blue-500/50 py-1 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}
                                <div className={`absolute top-0 right-0 p-4 ${plan.is_popular ? 'opacity-10' : 'opacity-5'}`}>
                                    {plan.billing_cycle === 'hourly' && <Clock className={`w-32 h-32 ${plan.is_popular ? 'text-white' : ''}`} />}
                                    {plan.billing_cycle === 'daily' && plan.is_popular && <Calendar className={`w-32 h-32 ${plan.is_popular ? 'text-white' : ''}`} />}
                                    {plan.billing_cycle === 'daily' && !plan.is_popular && <ShieldCheck className={`w-32 h-32 ${plan.is_popular ? 'text-white' : ''}`} />}
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${plan.is_popular ? 'text-white mt-4' : 'text-gray-900'}`}>{plan.name}</h3>
                                <p className={`mb-6 ${plan.is_popular ? 'text-blue-100' : 'text-gray-500'}`}>{plan.subtitle}</p>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className={`text-sm font-medium mr-1 ${plan.is_popular ? 'text-blue-100' : 'text-gray-500'}`}>From</span>
                                    <span className={`text-4xl font-extrabold ${plan.is_popular ? 'text-white' : 'text-gray-900'}`}>{format(plan.price_small)}</span>
                                    <span className={`font-medium ${plan.is_popular ? 'text-blue-200' : 'text-gray-500'}`}>/{plan.billing_cycle}/bag</span>
                                </div>
                                {plan.description && (
                                    <p className={`text-xs -mt-4 mb-6 ${plan.is_popular ? 'text-blue-200' : 'text-gray-400'}`}>{plan.description}</p>
                                )}

                                <ul className={`space-y-4 mb-8 flex-1 ${plan.is_popular ? 'text-blue-50' : ''}`}>
                                    {plan.features?.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm">
                                            {plan.is_popular ? (
                                                <div className="bg-blue-500/50 p-1 rounded-full"><Check className="w-3 h-3 text-white" /></div>
                                            ) : (
                                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                            )}
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <BookingModal>
                                    <Button className={`w-full font-bold h-12 rounded-xl ${plan.is_popular ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                                        {plan.billing_cycle === 'hourly' ? 'Book Hourly' : (plan.is_popular ? 'Book Daily' : 'Email for Quote')}
                                    </Button>
                                </BookingModal>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto px-6 mb-24">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
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
