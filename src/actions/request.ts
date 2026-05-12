"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateRequestStatus(id: string, newStatus: string) {
    try {
        const session = await auth();

        if (session?.user?.role === "student") {
            return { error: "Недостатньо прав для зміни статусу заявки." };
        }

        await db.maintenanceRequest.update({
            where: { id },
            data: { status: newStatus }
        });

        revalidatePath("/requests");
        return { success: true };
    } catch (error) {
        return { error: "Не вдалося оновити статус заявки." };
    }
}
export async function createRequest(formData: FormData) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return { error: "Не авторизовано." };
        }

        const student = await db.student.findUnique({
            where: { email: session.user.email },
            include: { placements: { where: { isCurrent: true } } }
        });

        if (!student) {
            return { error: "Профіль студента не знайдено." };
        }

        const title = formData.get("title") as string;
        const category = formData.get("category") as string;
        const priority = formData.get("priority") as string;
        const description = formData.get("description") as string;
        const isAnonymous = formData.get("isAnonymous") === "on";

        if (!title || !category || !priority || !description) {
            return { error: "Будь ласка, заповніть всі обов'язкові поля." };
        }

        const currentRoomId = student.placements[0]?.roomId || null;

        await db.maintenanceRequest.create({
            data: {
                title,
                category,
                priority,
                description,
                isAnonymous,
                studentId: student.id,
                roomId: category === "MAINTENANCE" ? currentRoomId : null,
            }
        });

        revalidatePath("/requests");
        return { success: true };
    } catch (error) {
        return { error: "Не вдалося створити заявку." };
    }
}