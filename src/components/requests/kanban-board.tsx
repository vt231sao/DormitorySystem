"use client"

import { useState, useOptimistic } from "react"
import { updateRequestStatus, deleteRequest } from "@/actions/request"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { uk } from "date-fns/locale"
import Link from "next/link"
import { Trash2 } from "lucide-react"

interface RequestData {
    id: string;
    studentId: string;
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
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const [optimisticRequests, dispatchOptimistic] = useOptimistic(
        initialRequests,
        (state, action: { type: string; id: string; status?: string }) => {
            if (action.type === "update") {
                return state.map(req => req.id === action.id ? { ...req, status: action.status! } : req);
            }
            if (action.type === "delete") {
                return state.filter(req => req.id !== action.id);
            }
            return state;
        }
    );

    const columns = [
        { id: "new", title: "Нові", color: "bg-blue-100 border-blue-200 text-blue-800" },
        { id: "in_progress", title: "В процесі", color: "bg-amber-100 border-amber-200 text-amber-800" },
        { id: "resolved", title: "Вирішено", color: "bg-green-100 border-green-200 text-green-800" }
    ];

    const handleStatusChange = async (requestId: string, newStatus: string) => {
        setLoadingId(requestId);
        dispatchOptimistic({ type: "update", id: requestId, status: newStatus });

        const result = await updateRequestStatus(requestId, newStatus);
        if (result.error) {
            alert(result.error);
        }

        setLoadingId(null);
    };

    const handleDelete = async (requestId: string) => {
        setLoadingId(requestId);
        dispatchOptimistic({ type: "delete", id: requestId });

        const result = await deleteRequest(requestId);
        if (result.error) {
            alert(result.error);
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

    const getPriorityBadge = (priority: string) => {
        switch(priority) {
            case 'high': return <Badge variant="destructive" className="text-[10px] h-5">Висока</Badge>;
            case 'medium': return <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-800 border-none">Середня</Badge>;
            case 'low': return <Badge variant="outline" className="text-[10px] h-5">Низька</Badge>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start overflow-x-auto h-full pb-4">
            {columns.map(column => {
                const columnRequests = optimisticRequests.filter(req => req.status === column.id);

                return (
                    <div key={column.id} className="flex flex-col flex-1 min-w-[320px] bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border h-full max-h-full overflow-hidden">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-semibold text-lg">{column.title}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${column.color}`}>
                {columnRequests.length}
              </span>
                        </div>

                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-2">
                            {columnRequests.length === 0 ? (
                                <div className="text-center p-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                                    Немає заявок
                                </div>
                            ) : (
                                columnRequests.map(request => (
                                    <Card key={request.id} className={`shadow-sm ${loadingId === request.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <div className="flex gap-2">
                                                    {getCategoryBadge(request.category)}
                                                    {getPriorityBadge(request.priority)}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground shrink-0">
                          {format(new Date(request.createdAt), 'dd MMM HH:mm', { locale: uk })}
                        </span>
                                            </div>
                                            <CardTitle className="text-base leading-tight">{request.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm space-y-3">
                                            <p className="text-muted-foreground">{request.description}</p>

                                            <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-md border text-xs space-y-1">
                                                {request.isAnonymous && !isStudent ? (
                                                    <div className="font-medium italic text-muted-foreground">Анонімний мешканець</div>
                                                ) : (
                                                    <>
                                                        <div className="font-medium">
                                                            {!isStudent ? (
                                                                <Link href={`/students/${request.studentId}`} className="hover:underline hover:text-blue-600">
                                                                    {request.student.lastName} {request.student.firstName}
                                                                </Link>
                                                            ) : (
                                                                <span>{request.student.lastName} {request.student.firstName}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between text-muted-foreground">
                                                            <span>{request.student.groupName}</span>
                                                            {request.student.phone && <span>{request.student.phone}</span>}
                                                        </div>
                                                    </>
                                                )}
                                                {(!request.isAnonymous || isStudent) && request.room?.number && (
                                                    <div className="text-blue-600 font-medium">Кімната: {request.room.number}</div>
                                                )}
                                            </div>
                                        </CardContent>

                                        {!isStudent && (
                                            <CardFooter className="p-4 pt-0 flex gap-2">
                                                <Select
                                                    value={request.status}
                                                    onValueChange={(val) => handleStatusChange(request.id, val)}
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

                                                {column.id === "resolved" && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(request.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
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