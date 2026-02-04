import { Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useCurrency } from '@/context/CurrencyContext';

export default function LocationCard() {
    const { format } = useCurrency();
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
            <div className="relative h-48 bg-gray-100 table-fixed">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.301033680765!2d121.01174827510467!3d14.524765685952651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9d1980b116b%3A0xd75b1c4cbc6933e2!2sTarragon%20Manila%20Baggage%20Storage%20Rental%20Services!5e0!3m2!1sen!2sph!4v1770096237038!5m2!1sen!2sph"
                    className="w-full h-full border-0 transition-all duration-500"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Tarragon Manila Location"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm z-10">
                    Open 24/7
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">Pasay City Central</h3>
                    <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.9</span>
                        <span className="text-gray-400">(120)</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">0.2 km away • 5 min walk</p>
                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-gray-900">{format(5)}</span>
                        <span className="text-xs text-gray-500">/bag/day</span>
                    </div>
                    <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700">Book</Button>
                </div>
            </div>
        </div>
    );
}
