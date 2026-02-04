import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "pending" | "completed" | "cancelled" | "stored" | "active" | "online" | "walk-in" | "booked" | "checked-in" | "checked-out";

interface StatusBadgeProps {
    status: string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase() as StatusType;

    const variants: Record<string, string> = {
        "booked": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
        "checked-in": "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200",
        "checked-out": "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
        pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
        processing: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
        completed: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
        cancelled: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
        stored: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200",
        active: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
        online: "bg-sky-100 text-sky-800 hover:bg-sky-100 border-sky-200",
        "walk-in": "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200",
    };

    const defaultVariant = "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";

    return (
        <Badge variant="outline" className={cn("capitalize whitespace-nowrap", variants[normalizedStatus] || defaultVariant, className)}>
            {status}
        </Badge>
    )
}
