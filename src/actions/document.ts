"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function addDocumentRecord(formData: FormData) {
    try {
        const session = await auth()
        if (session?.user?.role === "student") {
            return { error: "Недостатньо прав" }
        }

        const studentId = formData.get("studentId") as string
        const documentType = formData.get("documentType") as string
        const filePath = formData.get("filePath") as string

        if (!studentId || !documentType || !filePath) {
            return { error: "Заповніть всі поля" }
        }

        await db.document.create({
            data: {
                studentId,
                documentType,
                filePath
            }
        })

        revalidatePath(`/students/${studentId}`)
        return { success: true }
    } catch (error) {
        return { error: "Помилка при збереженні документа" }
    }
}

export async function deleteDocumentRecord(id: string, studentId: string) {
    try {
        const session = await auth()
        if (session?.user?.role === "student") {
            return { error: "Недостатньо прав" }
        }

        await db.document.delete({
            where: { id }
        })

        revalidatePath(`/students/${studentId}`)
        return { success: true }
    } catch (error) {
        return { error: "Помилка при видаленні" }
    }
}