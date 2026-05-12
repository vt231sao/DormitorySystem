import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import KanbanBoard from "@/components/requests/kanban-board"
import CreateRequestDialog from "@/components/requests/create-request-dialog"

export default async function RequestsPage() {
    const session = await auth();

    if (!session?.user) redirect("/auth/login");

    const isStudent = session.user.role === "student";
    let studentData = null;

    if (isStudent) {
        studentData = await db.student.findUnique({
            where: { email: session.user.email as string },
            select: { id: true }
        });

        if (!studentData) redirect("/profile");
    }

    const whereClause = isStudent && studentData ? { studentId: studentData.id } : {};

    const requests = await db.maintenanceRequest.findMany({
        where: whereClause,
        include: {
            student: {
                select: { firstName: true, lastName: true, phone: true, groupName: true }
            },
            room: {
                select: { number: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Заявки та Скарги</h1>
                    <p className="text-muted-foreground">
                        {isStudent ? "Ваші звернення до адміністрації гуртожитку." : "Управління запитами мешканців."}
                    </p>
                </div>

                {isStudent && <CreateRequestDialog />}
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard initialRequests={requests} isStudent={isStudent} />
            </div>
        </div>
    );
}