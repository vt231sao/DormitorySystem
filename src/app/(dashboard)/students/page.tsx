import { db } from "@/lib/db"
import AddStudentDialog from "@/components/students/add-student-dialog"
import StudentFilters from "@/components/students/student-filters"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Prisma } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import StudentActions from "@/components/students/student-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface StudentsPageProps {
    searchParams: Promise<{
        query?: string;
        payment?: string;
    }>;
}

export default async function StudentsPage(props: StudentsPageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const payment = searchParams?.payment || "";

    const whereClause: Prisma.StudentWhereInput = {
        OR: [
            { lastName: { contains: query, mode: "insensitive" } },
            { firstName: { contains: query, mode: "insensitive" } },
            { groupName: { contains: query, mode: "insensitive" } },
        ],
    };

    if (payment === "debt") {
        whereClause.payments = { some: { status: "debt" } };
    } else if (payment === "paid") {
        whereClause.payments = { some: { status: "paid" } };
    }

    const students = await db.student.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
            placements: {
                where: { isCurrent: true },
                include: { room: true }
            },
            payments: {
                orderBy: { dueDate: 'desc' },
                take: 1
            },
            documents: {
                select: { id: true }
            },
            maintenanceRequests: {
                where: {
                    status: { not: "resolved" },
                    isAnonymous: false
                },
                select: { id: true, status: true }
            }
        }
    });

    const serializedStudents = students.map(student => ({
        ...student,
        payments: student.payments.map(p => ({
            ...p,
            amount: p.amount.toString()
        }))
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Студенти</h1>
                    <p className="text-muted-foreground">
                        Управління базою мешканців гуртожитку.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <StudentFilters />
                    <AddStudentDialog />
                </div>
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-900 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ПІБ</TableHead>
                            <TableHead>Кімната</TableHead>
                            <TableHead>Оплата</TableHead>
                            <TableHead>Документи</TableHead>
                            <TableHead>Заявки</TableHead>
                            <TableHead className="text-right">Дії</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {serializedStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    За вашим запитом нікого не знайдено.
                                </TableCell>
                            </TableRow>
                        ) : (
                            serializedStudents.map((student) => {
                                const currentRoom = student.placements[0]?.room?.number;
                                const lastPaymentStatus = student.payments[0]?.status;
                                const initials = `${student.firstName[0]}${student.lastName[0]}`;
                                const activeRequestsCount = student.maintenanceRequests.length;
                                const docsCount = student.documents.length;

                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <Link href={`/students/${student.id}`} className="flex items-center gap-3 group">
                                                <Avatar className="h-9 w-9 border transition-colors group-hover:border-blue-500">
                                                    <AvatarImage src={student.photoUrl || ""} alt="Avatar" />
                                                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {student.lastName} {student.firstName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {student.groupName}
                                                    </span>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {currentRoom ? (
                                                <span className="font-semibold">{currentRoom}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm italic">Не поселено</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {!lastPaymentStatus ? (
                                                <span className="text-muted-foreground text-sm italic">Немає</span>
                                            ) : lastPaymentStatus === 'debt' ? (
                                                <Badge variant="destructive">Борг</Badge>
                                            ) : lastPaymentStatus === 'paid' ? (
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Оплачено</Badge>
                                            ) : (
                                                <Badge variant="secondary">Очікується</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {docsCount > 0 ? `${docsCount} шт.` : <span className="text-muted-foreground italic">0</span>}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {activeRequestsCount > 0 ? (
                                                <Badge variant="outline" className="text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-950">
                                                    {activeRequestsCount} активних
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Немає</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <StudentActions student={student} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}