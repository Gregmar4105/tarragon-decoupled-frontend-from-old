import { Luggage } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Luggage className="size-5 text-white" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm leading-none">
                <span className="truncate font-bold">
                    Tarragon Manila
                </span>
                <span className="truncate text-[10px] text-gray-500 uppercase tracking-wider">
                    Storage Rentals
                </span>
            </div>
        </>
    );
}
