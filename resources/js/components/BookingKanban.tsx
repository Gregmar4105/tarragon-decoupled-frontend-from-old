import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Package } from 'lucide-react';

// Mock data
const initialData = {
    booked: [
        { id: 'BK001', customer: 'John Doe', items: 2, time: '10:00 AM' },
        { id: 'BK002', customer: 'Jane Smith', items: 1, time: '11:00 AM' },
    ],
    "checked-in": [
        { id: 'BK003', customer: 'Bob Johnson', items: 3, time: '09:00 AM' },
    ],
    "checked-out": [
        { id: 'BK004', customer: 'Alice Brown', items: 2, time: 'Yesterday' },
    ]
};

const getCardBorderStyle = (columnId: string) => {
    switch (columnId) {
        case 'booked':
            return 'border-l-4 border-l-amber-400 border-t border-r border-b border-amber-200 bg-amber-50/50';
        case 'checked-in':
            return 'border-l-4 border-l-blue-500 border-t border-r border-b border-blue-200 bg-blue-50/50';
        case 'checked-out':
            return 'border-l-4 border-l-emerald-500 border-t border-r border-b border-emerald-200 bg-emerald-50/50';
        default:
            return 'border-gray-200';
    }
};

const getColumnHeaderStyle = (columnId: string) => {
    switch (columnId) {
        case 'booked':
            return 'text-amber-700';
        case 'checked-in':
            return 'text-blue-700';
        case 'checked-out':
            return 'text-emerald-700';
        default:
            return 'text-gray-700';
    }
};

const getBadgeStyle = (columnId: string) => {
    switch (columnId) {
        case 'booked':
            return 'bg-amber-100 text-amber-700 border-amber-300';
        case 'checked-in':
            return 'bg-blue-100 text-blue-700 border-blue-300';
        case 'checked-out':
            return 'bg-emerald-100 text-emerald-700 border-emerald-300';
        default:
            return '';
    }
};

export default function BookingKanban() {
    const [columns, setColumns] = useState(initialData);

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceCol = columns[source.droppableId as keyof typeof columns];
            const destCol = columns[destination.droppableId as keyof typeof columns];
            const [removed] = sourceCol.splice(source.index, 1);
            destCol.splice(destination.index, 0, removed);
            setColumns({ ...columns });
        } else {
            const column = columns[source.droppableId as keyof typeof columns];
            const [removed] = column.splice(source.index, 1);
            column.splice(destination.index, 0, removed);
            setColumns({ ...columns });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
                {Object.entries(columns).map(([columnId, items]) => (
                    <div key={columnId} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-2">
                            <h3 className={`font-bold capitalize ${getColumnHeaderStyle(columnId)}`}>
                                {columnId.replace('-', ' ')}
                            </h3>
                            <Badge variant="outline" className={getBadgeStyle(columnId)}>
                                {items.length}
                            </Badge>
                        </div>
                        <Droppable droppableId={columnId}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="bg-gray-50/80 rounded-xl p-4 flex flex-col gap-3 min-h-[200px]"
                                >
                                    {items.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`shadow-sm hover:shadow-md transition-all cursor-grab ${getCardBorderStyle(columnId)}`}
                                                >
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-mono text-xs text-gray-500 font-bold">{item.id}</span>
                                                            <Badge variant="outline" className="text-xs">{item.time}</Badge>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                                <User className="w-3.5 h-3.5 text-gray-500" />
                                                                {item.customer}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                                <Package className="w-3.5 h-3.5" />
                                                                {item.items} Bags
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

