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
                            <h3 className="font-bold text-gray-700 capitalize">{columnId}</h3>
                            <Badge variant="secondary">{items.length}</Badge>
                        </div>
                        <Droppable droppableId={columnId}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="bg-gray-100 rounded-xl p-4 flex flex-col gap-3 min-h-[200px]"
                                >
                                    {items.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="shadow-sm hover:shadow-md transition-shadow cursor-grab border-gray-200"
                                                >
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-mono text-xs text-gray-400 font-bold">{item.id}</span>
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
