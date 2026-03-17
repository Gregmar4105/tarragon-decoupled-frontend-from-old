import { Head } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LocationCard from '@/components/LocationCard';
import { Button } from '@/components/ui/button';
import { Map, List, Filter } from 'lucide-react';

export default function Search() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Head title="Find Storage" />
            <Navbar />

            <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
                {/* Listings Panel */}
                <div className="w-full md:w-1/2 lg:w-2/5 p-4 md:p-6 overflow-y-auto border-r border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Available Storage in Pasay City</h1>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" /> Filters
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        <LocationCard />
                        <LocationCard />
                        <LocationCard />
                        <LocationCard />
                        <LocationCard />
                    </div>
                </div>

                {/* Map Panel (Mock) */}
                <div className="hidden md:block w-1/2 lg:w-3/5 bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-gray-400 font-medium flex flex-col items-center">
                            <Map className="w-12 h-12 mb-2 opacity-50" />
                            <span>Interactive Map Placeholder</span>
                        </div>
                    </div>
                    {/* Mock Map Markers/Pins would go here */}
                </div>

                {/* Mobile Map Toggle */}
                <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2">
                    <Button className="rounded-full shadow-lg bg-gray-900 text-white gap-2 px-6">
                        <Map className="w-4 h-4" /> Map View
                    </Button>
                </div>
            </div>
        </div>
    );
}
