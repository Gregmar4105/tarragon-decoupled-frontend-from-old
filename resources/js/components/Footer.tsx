import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-12 px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                                    <path d="M6 20h0a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2-2v10a2 2 0 0 1-2 2h0" />
                                    <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
                                </svg>
                            </div>
                            <span className="font-bold text-gray-900 text-lg">Tarragon Manila</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Secure, convenient, and affordable luggage storage in Pasay City.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#" className="hover:text-blue-600">About Us</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#" className="hover:text-blue-600">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Contact Us</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Partner</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="#" className="hover:text-blue-600">Become a Partner</Link></li>
                            <li><Link href="/login" className="hover:text-blue-600">Partner Login</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Tarragon Manila. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
