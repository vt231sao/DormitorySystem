"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function payDebt(paymentId: string) {
    try {
        const session = await auth()
        if (!session?.user) return { error: "Не авторизовано" }

        await db.payment.update({
            where: { id: paymentId },
            data: {
                status: "paid",
                paymentDate: new Date()
            }
        })

        revalidatePath("/students/[id]", "page")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        return { error: "Помилка при обробці платежу" }
    }
}