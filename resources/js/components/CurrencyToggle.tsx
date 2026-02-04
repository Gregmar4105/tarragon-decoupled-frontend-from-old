import { ArrowRightLeft } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function CurrencyToggle() {
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
