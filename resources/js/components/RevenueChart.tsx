import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useCurrency } from "@/context/CurrencyContext"
import { useMemo } from "react"

interface RevenueChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const { convert, currency } = useCurrency();

    const convertedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            total: convert(item.total)
        }));
    }, [data, convert]);

    const yAxisFormatter = (value: number) => {
        const symbol = currency === 'USD' ? '$' : '₱';
        if (value >= 1000) {
            return `${symbol}${(value / 1000).toFixed(1)}k`;
        }
        return `${symbol}${value}`;
    };

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={convertedData}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={yAxisFormatter}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}
                    formatter={(value: number) => [
                        new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency,
                        }).format(value),
                        "Total Revenue"
                    ]}
                />
                <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
