
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users in DB:', users.length);
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    } catch (err) {
        console.error('Failed to fetch users:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
