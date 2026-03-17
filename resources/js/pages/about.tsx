import { Head } from '@inertiajs/react';
import { MapPin, ShieldCheck, Clock, Users, ArrowRight } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function About() {
    return (
        <>
            <Head title="About Us - Tarragon Manila" />
            <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
                <Navbar />

                <main className="flex-1">
                    {/* Hero Section */}
                    <div className="relative bg-gray-50 py-24">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
                                Our Mission: <span className="text-orange-500">Travel Lighter</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Tarragon Manila provides secure, convenient, and affordable luggage storage solutions for travelers in Metro Manila. We believe exploring the city should be burden-free.
                            </p>
                        </div>
                    </div>

                    {/* Story / Content Section */}
                    <div className="py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-bold text-gray-900">Why Choose Us?</h2>
                                    <p className="text-lg text-gray-600">
                                        Founded by travelers for travelers, we understand the hassle of dragging luggage around during layovers or after checking out of your hotel.
                                    </p>
                                    <p className="text-lg text-gray-600">
                                        Our facility is strategically located near NAIA Terminal 3, offering a safe haven for your belongings while you enjoy your last few hours in the Philippines.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                                            <ShieldCheck className="w-8 h-8 text-orange-500 shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-gray-900">Secure Storage</h3>
                                                <p className="text-sm text-gray-500">24/7 CCTV monitoring and strict access control.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                                            <Clock className="w-8 h-8 text-orange-500 shrink-0" />
                                            <div>
                                                <h3 className="font-bold text-gray-900">24/7 Access</h3>
                                                <p className="text-sm text-gray-500">Drop off or pick up your trusted items anytime.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Section - Requested Feature */}
                                <div className="h-[500px] w-full bg-gray-100 rounded-3xl overflow-hidden shadow-xl border border-gray-200 relative">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.301033680765!2d121.01174827510467!3d14.524765685952651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9d1980b116b%3A0xd75b1c4cbc6933e2!2sTarragon%20Manila%20Baggage%20Storage%20Rental%20Services!5e0!3m2!1sen!2sph!4v1770096237038!5m2!1sen!2sph"
                                        className="w-full h-full border-0 transition-all duration-500"
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Tarragon Manila Location Map"
                                    />
                                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Tarragon Corner</p>
                                                <p className="text-xs text-gray-500">Pasay City, Metro Manila</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="rounded-full text-xs h-8" asChild>
                                            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                                                Get Directions
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Section Placeholder */}
                    <div className="py-24 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-12">Meet the Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-400">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">Team Member {i}</h3>
                                        <p className="text-sm text-gray-500">Co-Founder</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-20 text-center">
                        <div className="max-w-3xl mx-auto px-6">
                            <h2 className="text-3xl font-bold mb-6">Have questions?</h2>
                            <p className="text-orange-50 mb-8">Our support team is available 24/7 to assist you with any inquiries.</p>
                            <div className="flex justify-center gap-4">
                                <BookingModal>
                                    <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 font-bold">
                                        Book Now
                                    </Button>
                                </BookingModal>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
