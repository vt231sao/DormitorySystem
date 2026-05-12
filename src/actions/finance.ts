"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function massAccrueDebt() {
    try {
        const session = await auth()

        if (session?.user?.role === "student") {
            return { error: "Недостатньо прав" }
        }

        const activePlacements = await db.placement.findMany({
            where: { isCurrent: true },
            select: { studentId: true }
        })

        if (activePlacements.length === 0) {
            return { error: "Немає активних мешканців для нарахування плати" }
        }

        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)

        const currentMonthName = new Date().toLocaleString('uk-UA', { month: 'long', year: 'numeric' })

        const payments = activePlacements.map(placement => ({
            studentId: placement.studentId,
            amount: 1500,
            billingPeriod: `Проживання: ${currentMonthName}`,
            status: "debt",
            dueDate: nextMonth
        }))

        await db.payment.createMany({
            data: payments
        })

        revalidatePath("/dashboard")
        revalidatePath("/students")

        return { success: true }
    } catch (error) {
        return { error: "Помилка при нарахуванні плати" }
    }
}