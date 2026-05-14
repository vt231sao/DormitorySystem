"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function addStudent(formData: FormData) {
    try {
        const firstName = formData.get("firstName") as string
        const lastName = formData.get("lastName") as string
        const patronymic = formData.get("patronymic") as string
        const gender = formData.get("gender") as string
        const groupName = formData.get("groupName") as string
        const email = formData.get("email") as string
        const phone = formData.get("phone") as string

        if (!firstName || !lastName || !gender || !groupName || !email) {
            return { error: "Будь ласка, заповніть всі обов'язкові поля" }
        }
        const existingUser = await db.user.findUnique({ where: { email } })
        const existingStudent = await db.student.findUnique({ where: { email } })

        if (existingStudent || existingUser) {
            return { error: "Користувач з такою поштою вже є в системі!" }
        }

        await db.$transaction(async (tx) => {
            await tx.student.create({
                data: {
                    firstName,
                    lastName,
                    patronymic: patronymic || null,
                    gender,
                    groupName,
                    email,
                    phone: phone || null,
                }
            })
            const fullName = `${firstName} ${lastName} ${patronymic || ""}`.trim()
            await tx.user.create({
                data: {
                    email,
                    fullName,
                    role: "student",
                }
            })
        })
        revalidatePath("/students")
        return { success: true }
    }
    catch (error) {
        return { error: "Не вдалося зберегти дані в базу." }
    }
}

export async function updateStudent(id: string, formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user) return { error: "Не авторизовано" }

        const isCommandant = session.user.role !== "student"
        const currentStudent = await db.student.findUnique({ where: { id } })

        if (!currentStudent) return { error: "Студента не знайдено" }

        const firstName = formData.get("firstName") as string
        const lastName = formData.get("lastName") as string
        const patronymic = formData.get("patronymic") as string
        const phone = formData.get("phone") as string

        if (!firstName || !lastName) {
            return { error: "Будь ласка, заповніть обов'язкові поля" }
        }

        const dataToUpdate: Record<string, string | null> = {
            firstName,
            lastName,
            patronymic: patronymic || null,
            phone: phone || null,
        }

        if (isCommandant) {
            const groupName = formData.get("groupName") as string
            const gender = formData.get("gender") as string
            const newEmail = formData.get("email") ? String(formData.get("email")) : null

            if (groupName) dataToUpdate.groupName = groupName
            if (gender) dataToUpdate.gender = gender

            await db.$transaction(async (tx) => {
                if (newEmail && newEmail !== currentStudent.email && currentStudent.email) {
                    const userRecord = await tx.user.findUnique({ where: { email: currentStudent.email } })
                    if (userRecord) {
                        await tx.user.update({
                            where: { email: currentStudent.email },
                            data: { email: newEmail }
                        })
                    }
                }

                await tx.student.update({
                    where: { id },
                    data: { ...dataToUpdate, email: newEmail }
                })
            })
        } else {
            await db.student.update({
                where: { id },
                data: dataToUpdate
            })
        }

        revalidatePath(`/students/${id}`)
        revalidatePath("/students")
        return { success: true }
    }
    catch (error) {
        return { error: "Не вдалося оновити дані" }
    }
}

export async function deleteStudent(id: string) {
    try {
        const session = await auth()
        if (session?.user?.role === "student") {
            return { error: "Недостатньо прав" }
        }

        const student = await db.student.findUnique({ where: { id } })
        if (!student) {
            return { error: "Студента не знайдено" }
        }

        await db.$transaction(async (tx) => {
            await tx.placement.deleteMany({ where: { studentId: id } })
            await tx.payment.deleteMany({ where: { studentId: id } })
            await tx.document.deleteMany({ where: { studentId: id } })
            await tx.maintenanceRequest.deleteMany({ where: { studentId: id } })
            await tx.violation.deleteMany({ where: { studentId: id } })
            await tx.student.delete({ where: { id } })

            if (student.email) {
                const user = await tx.user.findUnique({ where: { email: student.email } })
                if (user && user.role === "student") {
                    await tx.account.deleteMany({ where: { userId: user.id } })
                    await tx.user.delete({ where: { id: user.id } })
                }
            }
        })

        revalidatePath("/students")
        return { success: true }
    }
    catch (error) {
        return { error: "Неможливо видалити студента через внутрішню помилку БД" }
    }
}