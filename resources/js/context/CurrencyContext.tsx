import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Currency = 'USD' | 'PHP';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    convert: (amountInUSD: number) => number;
    format: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const EXCHANGE_RATE = 58; // 1 USD = 58 PHP

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    // Default to PHP
    const [currency, setCurrencyState] = useState<Currency>('PHP');

    useEffect(() => {
        const saved = localStorage.getItem('tarragon_currency');
        if (saved && (saved === 'USD' || saved === 'PHP')) {
            setCurrencyState(saved);
        }
    }, []);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem('tarragon_currency', c);
    };

    const convert = (amountInUSD: number) => {
        return currency === 'USD' ? amountInUSD : amountInUSD * EXCHANGE_RATE;
    };

    const formatter = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }), [currency]);

    const format = (amountInUSD: number) => {
        const converted = convert(amountInUSD);
        return formatter.format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
