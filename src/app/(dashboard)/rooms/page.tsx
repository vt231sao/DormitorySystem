import { db } from "@/lib/db"
import FloorFilter from "@/components/rooms/floor-filter"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench } from "lucide-react"

interface RoomsPageProps {
    searchParams: Promise<{
        floor?: string;
    }>;
}

export default async function RoomsPage(props: RoomsPageProps) {
    const searchParams = await props.searchParams;
    const currentFloor = Number(searchParams?.floor) || 1;

    const rooms = await db.room.findMany({
        where: { floor: currentFloor },
        include: {
            _count: {
                select: { placements: { where: { isCurrent: true } } }
            }
        },
        orderBy: { number: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Кімнати</h1>
                    <p className="text-muted-foreground">
                        Шахматка заселення гуртожитку.
                    </p>
                </div>

                <FloorFilter totalFloors={5} />
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Поверх {currentFloor}</h2>

                <div className="hidden sm:flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 rounded-sm"></div> Є місця</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white dark:bg-zinc-800 border rounded-sm"></div> Зайнято</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-200 dark:bg-gray-800 rounded-sm"></div> Ремонт</div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-4">
                {rooms.map((room) => {
                    const occupied = room._count.placements;
                    const isRepair = room.status === 'repair';
                    const isFull = occupied >= room.capacity;
                    const availableSpots = room.capacity - occupied;

                    let cardStyle = "border-2 transition-all hover:scale-105 cursor-pointer shadow-sm";
                    let statusText = `${occupied}/${room.capacity} зайнято`;

                    if (isRepair) {
                        cardStyle += " bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-70";
                        statusText = "Ремонт";
                    } else if (isFull) {
                        cardStyle += " bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800";
                        statusText = "Повністю зайнята";
                    } else {
                        cardStyle += " bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800";
                        statusText = `${availableSpots} вільних місць`;
                    }

                    return (
                        <Card key={room.id} className={cardStyle}>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-28 relative">
                <span className="text-3xl font-bold tracking-tighter text-zinc-800 dark:text-zinc-100 mb-1 flex items-center gap-2">
                  {room.number}
                    {isRepair && <Wrench className="w-5 h-5 text-gray-500" />}
                </span>
                                <span className="text-sm font-medium text-muted-foreground">
                  {statusText}
                </span>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}