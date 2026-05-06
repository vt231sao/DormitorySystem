"use client"

import { useState } from "react"
import { checkInStudent, checkOutStudent,toggleRoomStatus } from "@/actions/placement"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, UserMinus, UserPlus, ShieldAlert } from "lucide-react"

export interface StudentData {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string | null;
    gender: string;
    groupName: string;
}

export interface PlacementData {
    id: string;
    student: StudentData;
}

export interface RoomData {
    id: string;
    number: string;
    floor: number;
    capacity: number;
    status: string;
    roomGender: string;
    placements: PlacementData[];
}

interface RoomCardProps {
    room: RoomData;
    availableStudents: StudentData[];
}

export default function RoomCardDialog({ room, availableStudents }: RoomCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const currentPlacements = room.placements;
    const occupied = currentPlacements.length;
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

    const handleCheckIn = async () => {
        if (!selectedStudent) return;
        setIsLoading(true);
        setError("");
        const result = await checkInStudent(room.id, selectedStudent);
        setIsLoading(false);

        if (result.error) setError(result.error);
        else setSelectedStudent("");
    };

    const handleCheckOut = async (placementId: string) => {
        setIsLoading(true);
        setError("");
        const result = await checkOutStudent(placementId);
        setIsLoading(false);
        if (result.error) setError(result.error);
    };

    const handleToggleStatus = async () => {
        setIsLoading(true);
        setError("");
        const result = await toggleRoomStatus(room.id, room.status);
        setIsLoading(false);
        if (result.error) setError(result.error);
        else setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className={cardStyle}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-28 relative">
            <span className="text-3xl font-bold tracking-tighter text-zinc-800 dark:text-zinc-100 mb-1 flex items-center gap-2">
              {room.number}
                {isRepair && <Wrench className="w-5 h-5 text-gray-500" />}
            </span>
                        <span className="text-sm font-medium text-muted-foreground">{statusText}</span>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex justify-between items-start pr-4">
                        <div>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                Кімната {room.number}
                                {isRepair && <Badge variant="secondary">На ремонті</Badge>}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Поверх: {room.floor} | Місткість: {room.capacity} місця
                            </p>
                        </div>

                        <Button
                            variant={isRepair ? "default" : "outline"}
                            size="sm"
                            onClick={handleToggleStatus}
                            disabled={isLoading || (!isRepair && occupied > 0)}
                            className={isRepair ? "bg-green-600 hover:bg-green-700 text-white" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
                        >
                            {isRepair ? "Завершити ремонт" : <><Wrench className="w-4 h-4 mr-2" /> На ремонт</>}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-md flex items-start gap-2 text-sm font-medium">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div>
                        <h4 className="font-semibold mb-3 flex justify-between">
                            Поточні мешканці:
                            <span className="text-muted-foreground font-normal">({occupied}/{room.capacity})</span>
                        </h4>
                        {occupied === 0 ? (
                            <p className="text-sm text-muted-foreground italic border rounded-md p-3">Кімната порожня</p>
                        ) : (
                            <ul className="space-y-2">
                                {currentPlacements.map((placement) => (
                                    <li key={placement.id} className="flex items-center justify-between border rounded-md p-2 px-3 bg-zinc-50 dark:bg-zinc-900">
                                        <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {placement.student.lastName} {placement.student.firstName}
                      </span>
                                            <span className="text-xs text-muted-foreground">
                        Група: {placement.student.groupName}
                      </span>
                                        </div>
                                        <Button
                                            variant="destructive" size="sm"
                                            onClick={() => handleCheckOut(placement.id)}
                                            disabled={isLoading}
                                        >
                                            <UserMinus className="w-4 h-4 mr-1" /> Виселити
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {!isRepair && !isFull && (
                        <div className="pt-4 border-t space-y-3">
                            <h4 className="font-semibold">Поселити студента:</h4>
                            <div className="flex gap-2">
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Оберіть мешканця..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStudents.length === 0 ? (
                                            <SelectItem value="none" disabled>Немає вільних студентів</SelectItem>
                                        ) : (
                                            availableStudents.map(student => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.lastName} {student.firstName} ({student.gender === 'M' ? 'Ч' : 'Ж'}, {student.groupName})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleCheckIn} disabled={!selectedStudent || isLoading} className="bg-blue-600 hover:bg-blue-700">
                                    <UserPlus className="w-4 h-4 mr-1" /> Заселити
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}