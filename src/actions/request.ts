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