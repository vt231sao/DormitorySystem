import { db } from "@/lib/db"
import AddStudentDialog from "@/components/students/add-student-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function StudentsPage() {
    const students = await db.student.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            placements: {
                where: {isCurrent: true},
                include: {room: true}
            },
            payments: {
                orderBy: { dueDate: "desc" },
                take: 1
            }
        }
    });
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Студенти</h1>
                    <p className="text-muted-foreground">
                        Управління базою мешканців гуртожитку.
                    </p>
                </div>
                <AddStudentDialog />
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-900 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ПІБ</TableHead>
                            <TableHead>Група</TableHead>
                            <TableHead>Кімната</TableHead>
                            <TableHead>Оплата</TableHead>
                            <TableHead>Контакти</TableHead>
                            <TableHead className="text-right">Дії</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    Студентів ще не додано.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => {
                                const currentRoom = student.placements[0]?.room?.number;
                                const lastPaymentStatus = student.payments[0]?.status;

                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            {student.lastName} {student.firstName} {student.patronymic || ""}
                                        </TableCell>
                                        <TableCell>{student.groupName}</TableCell>

                                        <TableCell>
                                            {currentRoom ? (
                                                <span className="font-semibold">{currentRoom}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm italic">Не поселено</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {!lastPaymentStatus ? (
                                                <span className="text-muted-foreground text-sm italic">Немає даних</span>
                                            ) : lastPaymentStatus === 'debt' ? (
                                                <Badge variant="destructive">Борг</Badge>
                                            ) : lastPaymentStatus === 'paid' ? (
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Оплачено</Badge>
                                            ) : (
                                                <Badge variant="secondary">Очікується</Badge>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                {student.phone && <span>{student.phone}</span>}
                                                {student.email && <span className="text-muted-foreground">{student.email}</span>}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <span className="text-xs text-blue-500 cursor-pointer hover:underline">Деталі</span>
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