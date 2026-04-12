import { Luggage } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
                <Luggage className="size-5 text-white" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm leading-none">
                <span className="truncate font-bold">
                    Tarragon Manila
                </span>
                <span className="truncate text-[11px] text-gray-600 uppercase tracking-wider">
                    Luggage Storage
                </span>
            </div>
        </>
    );
}
