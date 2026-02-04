
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
    { name: "Mon", bookings: 12 },
    { name: "Tue", bookings: 18 },
    { name: "Wed", bookings: 15 },
    { name: "Thu", bookings: 25 },
    { name: "Fri", bookings: 32 },
    { name: "Sat", bookings: 45 },
    { name: "Sun", bookings: 38 },
]

export function DailyBookingsChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
