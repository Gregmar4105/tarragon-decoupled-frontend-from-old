import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { Calendar, User, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Booking {
    id: string;
    customer: string;
    time: string;
    items: number;
    status: string;
}

interface BookingInterface {
    id: string;
    customer: string;
    contact: string;
    bags: Record<string, number>;
    amount: number;
    status: string;
    source: string;
    checkIn: string;
    checkOut: string;
}

interface Props {
    bookings: BookingInterface[];
    onStatusChange?: (bookingId: string, newStatus: string) => void;
}

const getCardBorderStyle = (columnId: string) => {
    switch (columnId) {
        case 'booked':
            return 'border-l-4 border-l-yellow-300 border-t border-r border-b border-yellow-200 bg-yellow-50/50';
        case 'checked-in':
            return 'border-l-4 border-l-orange-600 border-t border-r border-b border-orange-200 bg-orange-50/50';
        case 'checked-out':
            return 'border-l-4 border-l-lime-400 border-t border-r border-b border-lime-200 bg-lime-50/50';
        default:
            return 'border-gray-200';
    }
};

const getColumnHeaderStyle = (columnId: string) => {
    switch (columnId) {
        case 'booked':
            return 'text-yellow-700';
        case 'checked-in':
            return 'text-orange-600';
        case 'checked-out':
            return 'text-lime-600';
        default:
            return 'text-gray-700';
    }
};

const getBadgeStyle = (columnId: string) => {
    switch (columnId) {
        case 'booked':
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'checked-in':
            return 'bg-orange-100 text-orange-600 border-orange-300';
        case 'checked-out':
            return 'bg-lime-100 text-lime-700 border-lime-300';
        default:
            return '';
    }
};

export default function BookingKanban({ bookings, onStatusChange }: Props) {
    const [columns, setColumns] = useState<Record<string, Booking[]>>({
        booked: [],
        "checked-in": [],
        "checked-out": []
    });

    // Translate dynamic Bookings array into column arrays based on status.
    useEffect(() => {
        const newCols: Record<string, Booking[]> = {
            booked: [],
            "checked-in": [],
            "checked-out": []
        };

        if (bookings) {
            bookings.forEach(b => {
                const totalBags = (b.bags.small || 0) + (b.bags.medium || 0) + (b.bags.large || 0) + (b.bags.plus || 0);
                const itemData: Booking = {
                    id: b.id,
                    customer: b.customer,
                    time: b.checkIn, // Show check in time on Kanban block
                    items: totalBags,
                    status: b.status
                };

                // Map standard Laravel DB statuses to UI statuses where needed
                let colKey = b.status.toLowerCase();

                // Route 'pending' to 'booked' and exact matches
                if (colKey === 'pending') colKey = 'booked';

                if (newCols[colKey]) {
                    newCols[colKey].push(itemData);
                } else {
                    // Fallback to booked bucket
                    newCols['booked'].push(itemData);
                }
            });
        }
        setColumns(newCols);
    }, [bookings]);

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceCol = [...columns[source.droppableId as keyof typeof columns]];
            const destCol = [...columns[destination.droppableId as keyof typeof columns]];
            const [removed] = sourceCol.splice(source.index, 1);
            destCol.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: sourceCol,
                [destination.droppableId]: destCol
            });

            // ... (in onDragEnd)

            if (onStatusChange) {
                // Call back up to parent (visually optimism)
                const newStatusMapped = destination.droppableId === 'booked' ? 'Pending' : destination.droppableId.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
                onStatusChange(removed.id, newStatusMapped);

                // Make API call
                router.put(`/bookings/${removed.id}`, {
                    status: newStatusMapped.toLowerCase()
                }, {
                    preserveScroll: true,
                    preserveState: true,
                });
            }

        } else {
            const column = [...columns[source.droppableId as keyof typeof columns]];
            const [removed] = column.splice(source.index, 1);
            column.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: column
            });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-3 gap-2 w-full h-full min-h-[500px] pb-4">
                {Object.entries(columns).map(([columnId, items]) => (
                    <div key={columnId} className="flex flex-col gap-2 w-full">
                        <div className="flex flex-col xl:flex-row items-center justify-between p-1 xl:p-2 gap-1">
                            <h3 className={`font-bold capitalize text-center text-[10px] md:text-sm ${getColumnHeaderStyle(columnId)}`}>
                                {columnId.replace('-', ' ')}
                            </h3>
                            <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 min-w-4 flex items-center justify-center ${getBadgeStyle(columnId)}`}>
                                {items.length}
                            </Badge>
                        </div>
                        <Droppable droppableId={columnId}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="bg-gray-50/80 rounded-lg p-1.5 md:p-4 flex flex-col gap-2 min-h-[200px]"
                                >
                                    {items.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`shadow-sm hover:shadow-md transition-all cursor-grab rounded-md ${getCardBorderStyle(columnId)}`}
                                                >
                                                    <CardContent className="p-2 md:p-4">
                                                        <div className="flex flex-col gap-0.5 overflow-hidden w-full">
                                                            <span className="font-mono text-[10px] md:text-xs text-gray-500 font-bold truncate w-full" title={item.id}>
                                                                #{item.id.slice(-6)}
                                                            </span>
                                                            <span className="text-[9px] md:text-xs text-gray-400 truncate w-full" title={item.time}>
                                                                {item.time}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-1 overflow-hidden mt-1 md:mt-2">
                                                            <div className="flex items-center gap-1.5 text-[10px] md:text-sm font-semibold text-gray-900 w-full" title={item.customer}>
                                                                <User className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-500 shrink-0" />
                                                                <span className="truncate">{item.customer}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[9px] md:text-xs text-gray-500 w-full">
                                                                <Package className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                                                                <span className="truncate">{item.items} Bags</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}

