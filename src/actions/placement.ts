"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function checkInStudent(roomId: string, studentId: string) {
    try {
        const room = await db.room.findUnique({ where: { id: roomId } });
        const student = await db.student.findUnique({ where: { id: studentId } });

        if (!room || !student) return { error: "Кімнату або студента не знайдено." };

        const currentPlacements = await db.placement.findMany({
            where: { roomId, isCurrent: true },
            include: { student: true }
        });

        if (currentPlacements.length >= room.capacity) {
            return { error: "Кімната повністю зайнята. Немає вільних ліжок." };
        }

        if (currentPlacements.length > 0) {
            const existingGender = currentPlacements[0].student.gender;
            if (student.gender !== existingGender) {
                return { error: `У цій кімнаті вже проживають ${existingGender === 'M' ? 'хлопці' : 'дівчата'}. Змішане поселення заборонено.` };
            }
        } else if (room.roomGender !== 'any' && room.roomGender !== 'mixed') {
            const expectedGender = room.roomGender === 'male' ? 'M' : 'F';
            if (student.gender !== expectedGender) {
                return { error: `Ця кімната призначена тільки для ${room.roomGender === 'male' ? 'хлопців' : 'дівчат'}.` };
            }
        }

        await db.$transaction(async (tx) => {
            await tx.placement.updateMany({
                where: { studentId, isCurrent: true },
                data: { isCurrent: false, checkOutDate: new Date() }
            });

            await tx.placement.create({
                data: {
                    studentId,
                    roomId,
                    checkInDate: new Date(),
                    isCurrent: true
                }
            });
        });

        revalidatePath("/rooms");
        revalidatePath("/students");
        return { success: true };
    } catch (error) {
        console.error("Помилка заселення:", error);
        return { error: "Внутрішня помилка сервера." };
    }
}

export async function checkOutStudent(placementId: string) {
    try {
        await db.placement.update({
            where: { id: placementId },
            data: { isCurrent: false, checkOutDate: new Date() }
        });

        revalidatePath("/rooms");
        revalidatePath("/students");
        return { success: true };
    } catch (error) {
        console.error("Помилка виселення:", error);
        return { error: "Не вдалося виселити студента." };
    }
}
export async function toggleRoomStatus(roomId: string, currentStatus: string) {
    try {
        const newStatus = currentStatus === 'active' ? 'repair' : 'active';

        if (newStatus === 'repair') {
            const occupiedCount = await db.placement.count({
                where: { roomId, isCurrent: true }
            });

            if (occupiedCount > 0) {
                return { error: "Неможливо почати ремонт: у кімнаті ще проживають студенти. Спочатку виселіть їх." };
            }
        }

        await db.room.update({
            where: { id: roomId },
            data: { status: newStatus }
        });

        revalidatePath("/rooms");
        return { success: true };
    } catch (error) {
        console.error("Помилка зміни статусу кімнати:", error);
        return { error: "Не вдалося змінити статус кімнати." };
    }
}