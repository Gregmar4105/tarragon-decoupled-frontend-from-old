import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string | number
    description?: React.ReactNode
    icon?: React.ReactNode
    className?: string
    trend?: {
        value: number
        label: string
        direction: "up" | "down" | "neutral"
    }
}

export function StatsCard({ title, value, description, icon, className, trend }: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <div className="first-letter:mt-1 flex items-center text-xs text-muted-foreground">
                        {trend && (
                            <span className={cn(
                                "mr-2 font-medium flex items-center",
                                trend.direction === "up" && "text-green-600",
                                trend.direction === "down" && "text-red-600",
                            )}>
                                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : ''} {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
