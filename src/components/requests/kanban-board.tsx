"use client"

import { useState } from "react"
import { updateRequestStatus } from "@/actions/request"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { uk } from "date-fns/locale"

interface RequestData {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    isAnonymous: boolean;
    createdAt: Date;
    student: {
        firstName: string;
        lastName: string;
        phone: string | null;
        groupName: string;
    };
    room: {
        number: string;
    } | null;
}

interface KanbanBoardProps {
    initialRequests: RequestData[];
    isStudent: boolean;
}

export default function KanbanBoard({ initialRequests, isStudent }: KanbanBoardProps) {
    const [requests, setRequests] = useState<RequestData[]>(initialRequests);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const columns = [
        { id: "new", title: "Нові", color: "bg-blue-100 border-blue-200 text-blue-800" },
        { id: "in_progress", title: "В процесі", color: "bg-amber-100 border-amber-200 text-amber-800" },
        { id: "resolved", title: "Вирішено", color: "bg-green-100 border-green-200 text-green-800" }
    ];

    const handleStatusChange = async (requestId: string, newStatus: string) => {
        setLoadingId(requestId);

        setRequests(prev =>
            prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
        );

        const result = await updateRequestStatus(requestId, newStatus);

        if (result.error) {
            setRequests(initialRequests);
        }

        setLoadingId(null);
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "MAINTENANCE": return <Badge variant="outline">Ремонт</Badge>;
            case "COMPLAINT": return <Badge variant="destructive">Скарга</Badge>;
            case "SUGGESTION": return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">Побажання</Badge>;
            default: return <Badge variant="secondary">{category}</Badge>;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start overflow-x-auto pb-4">
            {columns.map(column => {
                const columnRequests = requests.filter(req => req.status === column.id);

                return (
                    <div key={column.id} className="flex-1 min-w-[320px] bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">{column.title}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${column.color}`}>
                {columnRequests.length}
              </span>
                        </div>

                        <div className="space-y-4">
                            {columnRequests.length === 0 ? (
                                <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                                    Немає заявок
                                </div>
                            ) : (
                                columnRequests.map(request => (
                                    <Card key={request.id} className={`shadow-sm ${loadingId === request.id ? 'opacity-50' : ''}`}>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                {getCategoryBadge(request.category)}
                                                <span className="text-xs text-muted-foreground">
                          {format(new Date(request.createdAt), 'dd MMM HH:mm', { locale: uk })}
                        </span>
                                            </div>
                                            <CardTitle className="text-base leading-tight">{request.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm space-y-3">
                                            <p className="text-muted-foreground line-clamp-3">{request.description}</p>

                                            <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-md border text-xs space-y-1">
                                                {request.isAnonymous && !isStudent ? (
                                                    <div className="font-medium italic text-muted-foreground">Анонімний мешканець</div>
                                                ) : (
                                                    <>
                                                        <div className="font-medium">{request.student.lastName} {request.student.firstName}</div>
                                                        <div className="flex justify-between text-muted-foreground">
                                                            <span>{request.student.groupName}</span>
                                                            {request.student.phone && <span>{request.student.phone}</span>}
                                                        </div>
                                                    </>
                                                )}
                                                {request.room?.number && (
                                                    <div className="text-blue-600 font-medium">Кімната: {request.room.number}</div>
                                                )}
                                            </div>
                                        </CardContent>

                                        {!isStudent && (
                                            <CardFooter className="p-4 pt-0">
                                                <Select
                                                    value={request.status}
                                                    onValueChange={(val) => handleStatusChange(request.id, val)}
                                                    disabled={loadingId === request.id}
                                                >
                                                    <SelectTrigger className="w-full h-8 text-xs">
                                                        <SelectValue placeholder="Змінити статус" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">Нова заявка</SelectItem>
                                                        <SelectItem value="in_progress">В процесі</SelectItem>
                                                        <SelectItem value="resolved">Вирішено</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </CardFooter>
                                        )}
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}