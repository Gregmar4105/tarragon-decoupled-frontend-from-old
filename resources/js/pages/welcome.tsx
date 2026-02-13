import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BookingModal from '@/components/BookingModal';
import BaggageScanner from '@/components/BaggageScanner';
import LocationCard from '@/components/LocationCard';
import { useState } from 'react';
import {
    ShieldCheck,
    Clock,
    MapPin,
    Calendar,
    Star,
    Plane,
    Luggage,
    Users,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/context/CurrencyContext';

export default function Welcome() {
    const { format } = useCurrency();
    return (
        <>
            <Head title="Tarragon Manila - Luggage Storage Near NAIA Terminal 3" />
            <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
                <Navbar />

                <main className="flex-1">
                    {/* Hero Section */}
                    <div className="relative bg-[#F8FAFC] overflow-hidden">
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        <ParticleBackground className="absolute inset-0 z-0" />

                        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-24 relative z-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="space-y-8"
                                >
                                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                                        <Plane className="w-4 h-4" />
                                        Minutes from NAIA Terminal 3
                                    </div>
                                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                                        Secure Luggage Storage <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">in Pasay City.</span>
                                    </h1>
                                    <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                                        Located at <strong>Tarragon Corner</strong>. Secure, affordable, and convenient storage for your bags, boxes, and sports equipment. Open 24/7.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <BookingModal>
                                            <Button size="lg" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-blue-200 transition-all">
                                                Book Storage Now
                                            </Button>
                                        </BookingModal>
                                        <Link href="/pricing">
                                            <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 font-bold text-lg w-full">
                                                View Rates
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Trust Indicators */}
                                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span>4.9/5 Rating</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                            <span>Insured up to {format(750)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            <span>24/7 Access</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Hero Image / Visual */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="relative hidden lg:block"
                                >
                                    <div className="relative w-full aspect-square max-w-md mx-auto">
                                        {/* Main Card */}
                                        <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 flex flex-col transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                            <div className="h-48 bg-gray-100 rounded-2xl mb-6 overflow-hidden relative">
                                                <iframe
                                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.301033680765!2d121.01174827510467!3d14.524765685952651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9d1980b116b%3A0xd75b1c4cbc6933e2!2sTarragon%20Manila%20Baggage%20Storage%20Rental%20Services!5e0!3m2!1sen!2sph!4v1770096237038!5m2!1sen!2sph"
                                                    className="w-full h-full border-0 transition-all duration-500"
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    title="Tarragon Manila Location"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-gray-100 pointer-events-none">
                                                    0.5km to Airport
                                                </div>
                                            </div>
                                            <div className="space-y-4 px-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-xl text-gray-900">Tarragon Manila</h3>
                                                        <p className="text-gray-500 text-sm flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> Pasay City, Metro Manila
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-lg text-blue-600">{format(5)}</span>
                                                        <span className="text-xs text-gray-500">/day</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">CCTV Monitored</div>
                                                    <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">Insured</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-white border-y border-gray-100">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100 md:divide-none">
                                <div>
                                    <div className="text-3xl font-extrabold text-gray-900 mb-1">500+</div>
                                    <div className="text-sm text-gray-500 font-medium">Bags Stored</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-extrabold text-gray-900 mb-1">24/7</div>
                                    <div className="text-sm text-gray-500 font-medium">Secure Access</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-extrabold text-gray-900 mb-1">5 min</div>
                                    <div className="text-sm text-gray-500 font-medium">Walk to Bridge</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-extrabold text-gray-900 mb-1">4.9</div>
                                    <div className="text-sm text-gray-500 font-medium">Customer Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Baggage Scanner */}
                    <BaggageScanner />

                    {/* How It Works */}
                    <div className="py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                                <Clock className="w-4 h-4" />
                                Easy Process
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-16">Simple & Secure Storage</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="flex flex-col items-center gap-6 relative">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-lg shadow-blue-100">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">1. Book Online</h3>
                                    <p className="text-gray-600 max-w-xs mx-auto">Reserve your space in advance to guarantee availability. It takes less than 2 minutes.</p>
                                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-gradient-to-r from-blue-100 to-transparent -z-10 translate-x-[20%]" />
                                </div>
                                <div className="flex flex-col items-center gap-6 relative">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-lg shadow-blue-100">
                                        <MapPin className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">2. Drop at Tarragon</h3>
                                    <p className="text-gray-600 max-w-xs mx-auto">Located conveniently near NAIA Terminal 3. Show your QR code and drop your bags.</p>
                                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-gradient-to-r from-blue-100 to-transparent -z-10 translate-x-[20%]" />
                                </div>
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-lg shadow-blue-100">
                                        <Luggage className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">3. Enjoy Manila</h3>
                                    <p className="text-gray-600 max-w-xs mx-auto">Explore Resorts World, Mall of Asia, or take your flight lighter and hands-free.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonials */}
                    <div className="py-24 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">What Travelers Say</h2>
                                <p className="text-gray-600">Join hundreds of satisfied customers who trust us with their luggage.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        name: "Sarah Jenkins",
                                        role: "From UK",
                                        text: "Lifesaver! We had an 8-hour layover and didn't want to drag our bags around. The location is super close to Terminal 3.",
                                        stars: 5
                                    },
                                    {
                                        name: "Michael Chen",
                                        role: "From Singapore",
                                        text: "Very secure and professional. The staff was friendly and the booking process was seamless. Highly recommended.",
                                        stars: 5
                                    },
                                    {
                                        name: "David Smith",
                                        role: "From Australia",
                                        text: "Great price for the service. I felt very safe leaving my surfboard here while I explored the city for a day.",
                                        stars: 4
                                    }
                                ].map((review, i) => (
                                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} className={`w-4 h-4 ${j < review.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-6 italic">"{review.text}"</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                                {review.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                                                <p className="text-xs text-gray-500">{review.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div id="location" className="py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Conveniently Located</h2>
                                    <div className="space-y-6 text-lg text-gray-600">
                                        <p>
                                            We are located at <strong>Tarragon Corner</strong>, just minutes away from Ninoy Aquino International Airport (NAIA) Terminal 3.
                                        </p>
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                            <ul className="space-y-4">
                                                <li className="flex items-center gap-3">
                                                    <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                                        <MapPin className="text-blue-600 w-5 h-5 shrink-0" />
                                                    </div>
                                                    <span className="font-medium">Easy access from Runway Manila footbridge</span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                                        <Clock className="text-blue-600 w-5 h-5 shrink-0" />
                                                    </div>
                                                    <span className="font-medium">Open 24 Hours / 7 Days a week</span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                                        <ShieldCheck className="text-blue-600 w-5 h-5 shrink-0" />
                                                    </div>
                                                    <span className="font-medium">24/7 Security & CCTV Monitoring</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="outline" className="gap-2 rounded-full h-12 px-6" asChild>
                                                <a href="https://waze.com/ul?ll=14.5247657,121.0143232&navigate=yes" target="_blank" rel="noopener noreferrer">
                                                    <MapPin className="w-4 h-4" />
                                                    Navigate with Waze
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[400px] bg-gray-200 rounded-3xl overflow-hidden relative shadow-lg">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.301033680765!2d121.01174827510467!3d14.524765685952651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9d1980b116b%3A0xd75b1c4cbc6933e2!2sTarragon%20Manila%20Baggage%20Storage%20Rental%20Services!5e0!3m2!1sen!2sph!4v1770096237038!5m2!1sen!2sph"
                                        className="w-full h-full border-0 transition-all duration-500"
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Tarragon Manila Location"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="py-24 bg-blue-900 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            {/* Pattern placeholder */}
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 L100 0 L100 100 Z" fill="white" />
                            </svg>
                        </div>
                        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-8 tracking-tight">Ready to lighten your load?</h2>
                            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Book securely online in less than 2 minutes. Instant confirmation.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <BookingModal>
                                    <Button size="lg" className="h-14 px-8 rounded-full bg-white text-blue-900 hover:bg-gray-100 font-bold text-lg shadow-xl hover:scale-105 transition-transform">
                                        Book Storage Now
                                    </Button>
                                </BookingModal>
                                <Link href="/pricing">
                                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-full bg-blue-600 border-blue-600 text-white hover:bg-blue-500 font-bold text-lg shadow-lg">
                                        Check Rates
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
