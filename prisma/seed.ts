// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 1. Створення системного адміністратора
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const user = await prisma.user.upsert({
        where: { email: 'admin1@gmail.com' },
        update: {},
        create: {
            email: 'admin1@gmail.com',
            passwordHash: hashedPassword,
            fullName: 'Головний Комендант',
            role: 'admin',
        },
    })
    console.log('Seed: Admin user created/updated:', user.email)

    // 2. Генерація 100 кімнат (5 поверхів по 20)
    const roomsToCreate = []
    for (let floor = 1; floor <= 5; floor++) {
        for (let roomIndex = 1; roomIndex <= 20; roomIndex++) {
            const roomNumber = `${floor}${roomIndex.toString().padStart(2, '0')}`
            const capacity = Math.floor(Math.random() * 3) + 2 // 2, 3 або 4 місця
            const status = roomNumber === '303' ? 'repair' : 'active'

            roomsToCreate.push({
                number: roomNumber,
                floor: floor,
                capacity: capacity,
                roomGender: 'any',
                status: status
            })
        }
    }

    await prisma.room.createMany({
        data: roomsToCreate,
        skipDuplicates: true,
    })

    console.log(`Seed: 100 кімнат успішно згенеровано.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1)
    })