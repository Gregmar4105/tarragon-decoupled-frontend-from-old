import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/BookingModal';
import { Share, User } from 'lucide-react';
import { login } from '@/routes';

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 lg:px-12 bg-white">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-white"
                    >
                        <path d="M6 20h0a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2-2v10a2 2 0 0 1-2 2h0" />
                        <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
                    </svg>
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-gray-900 text-lg">Tarragon Manila</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Luggage Storage Rentals</span>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link href="#" className="hover:text-gray-900 transition-colors">Pricing</Link>
                <Link href="#" className="hover:text-gray-900 transition-colors">How It Works</Link>
            </div>

            <div className="flex items-center gap-4">
                <BookingModal>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
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
