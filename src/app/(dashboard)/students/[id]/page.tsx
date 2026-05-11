import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import StudentProfileClient from "./student-profile-client"

export default async function StudentPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();

    if (!session?.user) redirect("/auth/login");

    const student = await db.student.findUnique({
        where: { id: params.id },
        include: {
            placements: {
                include: { room: true },
                orderBy: { checkInDate: 'desc' }
            },
            payments: {
                orderBy: { dueDate: 'desc' }
            },
            violations: {
                orderBy: { date: 'desc' }
            },
            documents: true
        }
    });

    if (!student) notFound();

    const serializedStudent = {
        ...student,
        payments: student.payments.map(p => ({
            ...p,
            amount: p.amount.toString(),
        }))
    };

    const isCommandant = session.user.role !== "student";
    const isOwner = session.user.email === student.email;

    if (!isCommandant && !isOwner) {
        redirect("/profile");
    }

    const canEditEverything = isCommandant;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Особистий кабінет</h1>
                    <p className="text-muted-foreground">
                        {isCommandant ? "Перегляд та редагування картки мешканця" : "Ваша персональна інформація"}
                    </p>
                </div>
            </div>

            <StudentProfileClient
                student={serializedStudent}
                canEditEverything={canEditEverything}
            />
        </div>
    );
}