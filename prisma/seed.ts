import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
    const room = await prisma.room.upsert({
        where: { number: '101' },
        update: {},
        create: {
            number: '101',
            floor: 1,
            capacity: 4,
            roomGender: 'male',
        },
    })
    console.log('Seed: Room created/updated:', room.number)

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