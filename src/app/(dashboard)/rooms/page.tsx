import { db } from "@/lib/db"
import FloorFilter from "@/components/rooms/floor-filter"
import RoomCardDialog from "@/components/rooms/room-card-dialog"

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
            placements: {
                where: { isCurrent: true },
                include: { student: true }
            }
        },
        orderBy: { number: 'asc' }
    });

    const unassignedStudents = await db.student.findMany({
        where: {
            placements: {
                none: { isCurrent: true }
            }
        },
        orderBy: { lastName: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Кімнати</h1>
                </div>
                <FloorFilter totalFloors={5} />
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Поверх {currentFloor}</h2>

                <div className="hidden sm:flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 rounded-sm"></div> Є місця</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border rounded-sm"></div> Зайнято</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-200 rounded-sm"></div> Ремонт</div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-4">
                {rooms.map((room) => (
                    <RoomCardDialog
                        key={room.id}
                        room={room}
                        availableStudents={unassignedStudents}
                    />
                ))}
            </div>
        </div>
    );
}