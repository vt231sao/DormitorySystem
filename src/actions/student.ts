"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addStudent(formData: FormData) {
    try {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const patronymic = formData.get("patronymic") as string;
        const gender = formData.get("gender") as string;
        const groupName = formData.get("groupName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;

        if (!firstName || !lastName || !gender || !groupName  || !email) {
            return { error: "Будь ласка, заповніть всі обов'язкові поля" };
        }
        const existingUser = await db.user.findUnique({ where: { email } });
        const existingStudent = await db.student.findUnique({ where: { email } });

        if (existingStudent || existingUser) {
            return { error: "Користувач з такою поштою вже є в системі!"}
        }
        await db.$transaction(async (tx) => {
            const student = await tx.student.create({
            data: {
                firstName,
                    lastName,
                    patronymic: patronymic || null,
                    gender,
                    groupName,
                    email,
                    phone: phone || null,
            }
            });
            const fullName = `${firstName} ${lastName} ${patronymic || ""}`.trim();
            await tx.user.create({
                data: {
                    email,
                    fullName,
                    role: "student",
                }
            })
        })
        revalidatePath("/students");

        return { success: true };
    }
    catch (error) {
        console.error("Помилка додавання студента:", error);
        return { error: "Не вдалося зберегти дані в базу." };
    }
}