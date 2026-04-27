import { PrismaClient } from '@prisma/client'
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
    console.log({ room })
}
main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })