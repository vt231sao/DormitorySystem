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

export async function updateStudent(id: string, formData: FormData) {
    try{
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const patronymic = formData.get("patronymic") as string;
        const gender = formData.get("gender") as string;
        const groupName = formData.get("groupName") as string;
        const phone = formData.get("phone") as string;

        if (!firstName || !lastName || !gender || !groupName) {
            return { error: "Будь ласка, заповніть всі обов'язкові поля"}
        }
        await db.student.update({
            where: { id},
            data: {
                firstName,
                lastName,
                patronymic: patronymic || null,
                gender,
                groupName,
                phone: phone || null,
            }
        });

        revalidatePath("/students");
        return { success: true };

    }
    catch (error) {
        console.error("Помилка оновлення студента",error);
        return { error: "Не вдалося оновити дані" };
    }
}
export async function deleteStudent(id: string) {
    try {
        const student = await db.student.findUnique({ where: { id } });
        if (!student) {
            return {error: "Студента не знайдено"}
        }
        await db.$transaction(async (tx) => {
                await tx.student.delete({ where: { id } });
                if(student.email) {
                    await tx.user.delete({where: {email: student.email}}).catch(() => {

                    });
                }
        })
        revalidatePath("/students");
        return { success: true };
    }
    catch (error) {
        console.log("Помилка видалення студента");
        return {error: "Неможливо видалити студента: існують пов'язані дані (оплати або історія поселень)"};
    }

}