import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/BookingModal';
import { Share, User, Luggage, ArrowRightLeft } from 'lucide-react';
import { login } from '@/routes';
import { useCurrency } from '@/context/CurrencyContext';
import NotificationBell from './NotificationBell';

function CurrencyToggle() {
    const { currency, setCurrency } = useCurrency();
    const toggle = () => setCurrency(currency === 'USD' ? 'PHP' : 'USD');

    return (
        <button
            onClick={toggle}
            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
        >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {currency}
        </button>
    );
}

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 lg:px-12 bg-white">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Luggage className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-gray-900 text-lg">Tarragon Manila</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Luggage Storage Rentals</span>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
                <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
                <Link href="/about" className="hover:text-gray-900 transition-colors">About Us</Link>

            </div>

            <div className="flex items-center gap-4">
                <Link href="/track" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900">
                    Track Booking
                </Link>
                <BookingModal>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                        Book Now
                    </Button>
                </BookingModal>
                <Link href={login()}>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-transparent gap-2 px-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                        >
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" x2="3" y1="12" y2="12" />
                        </svg>
                        Login
                    </Button>
                </Link>
            </div>
        </nav>
    );
}
