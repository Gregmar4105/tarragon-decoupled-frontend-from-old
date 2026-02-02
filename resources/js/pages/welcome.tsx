import { Head } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BookingModal from '@/components/BookingModal';
import { useState } from 'react';
import { Camera, ChevronDown } from 'lucide-react';

export default function Welcome() {
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-white font-sans text-[#1b1b18] selection:bg-[#FF2D20] selection:text-white">
                <Navbar />

                <main>
                    {/* Hero Section */}
                    <div className="w-full bg-[#EBF5FF] py-20 px-6 lg:px-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-r border-l border-blue-200/50 max-w-6xl" />
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-full border-t border-b border-blue-200/50 max-h-[300px]" />
                        </div>

                        <div className="relative z-10 max-w-4xl mx-auto">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-gray-900 mb-6">
                                Secure Luggage Storage in <br />
                                <span className="font-normal">Pasay City</span>
                            </h1>
                            <p className="text-gray-600 max-w-lg mx-auto text-lg mb-8 leading-relaxed">
                                Secure the personal luggage storage and community with sams.
                            </p>
                        </div>
                    </div>

                    {/* Smart Pricing Section */}
                    <div className="py-16 px-6 lg:px-12 max-w-5xl mx-auto">
                        <h2 className="text-3xl font-normal text-center mb-10">Smart Pricing & AI Scan</h2>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('manual')}
                                    className={`flex-1 py-4 text-center text-sm font-medium transition-colors relative ${activeTab === 'manual'
                                        ? 'text-gray-900 bg-white'
                                        : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    Manual Size Input
                                    {activeTab === 'manual' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className={`flex-1 py-4 text-center text-sm font-medium transition-colors relative ${activeTab === 'ai'
                                        ? 'text-gray-900 bg-white'
                                        : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                >
                                    AI-Powered Scan
                                    {activeTab === 'ai' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                                    )}
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12">
                                {activeTab === 'manual' ? (
                                    <div className="space-y-6">
                                        {/* Dimensions Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600">Height (cm)</label>
                                                <Input type="number" placeholder="0" className="h-12 rounded-full border-gray-200 px-6 text-center focus:ring-blue-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600">Width (cm)</label>
                                                <Input type="number" placeholder="0" className="h-12 rounded-full border-gray-200 px-6 text-center focus:ring-blue-600" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600">Depth (cm)</label>
                                                <Input type="number" placeholder="0" className="h-12 rounded-full border-gray-200 px-6 text-center focus:ring-blue-600" />
                                            </div>
                                        </div>

                                        {/* Dropdown Row */}
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Depth (cm)</label>
                                            <div className="relative">
                                                <select className="flex h-12 w-full items-center justify-between rounded-full border border-gray-200 bg-white px-6 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-gray-400">
                                                    <option value="" disabled selected>Select option</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Book Now Button */}
                                        <BookingModal>
                                            <Button className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-base">
                                                Book Now
                                            </Button>
                                        </BookingModal>

                                        {/* Price Estimate */}
                                        <div className="bg-[#eff6ff] rounded-xl p-8 text-center mt-8">
                                            <p className="text-sm text-gray-500 mb-1">Price Estimate</p>
                                            <p className="text-4xl font-bold text-gray-900">$1.00</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4">
                                        {/* Mockup for Camera View */}
                                        <div className="w-full aspect-video bg-[#eff6ff] rounded-lg border border-gray-200 relative flex items-center justify-center overflow-hidden mb-8">
                                            {/* Diagonal Lines for placeholder effect */}
                                            <div className="absolute inset-0">
                                                <svg className="w-full h-full text-gray-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
                                                    <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
                                                </svg>
                                            </div>

                                            {/* Camera Icon */}
                                            <div className="relative z-10 bg-[#99a1af] p-5 rounded-2xl shadow-sm">
                                                <Camera className="w-8 h-8 text-white" strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-base">
                                            Scan Luggage
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Chat Widget Button */}
                <button className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>
        </>
    );
}
