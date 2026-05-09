import prisma from '../db/client'

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    isVerified: true,
    createdAt: true,
} as const

export const UserRepository = {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: userSelect,
        })
    },

    async findByEmailWithPassword(email: string) {
        return prisma.user.findUnique({
            where: { email },
        })
    },

    async findById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: userSelect,
        })
    },

    async findAll() {
        return prisma.user.findMany({
            select: userSelect,
            orderBy: { createdAt: 'desc' },
        })
    },

    async create(data: { email: string; password: string; name: string; role?: string; isVerified?: boolean; isActive?: boolean }) {
        return prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                role: (data.role as any) || 'STUDENT',
                isVerified: data.isVerified ?? true,
                isActive: data.isActive ?? true,
            },
            select: userSelect,
        })
    },

    async update(id: number, data: { name?: string; email?: string; password?: string; role?: string; isActive?: boolean; isVerified?: boolean }) {
        return prisma.user.update({
            where: { id },
            data,
            select: userSelect,
        })
    },

    async updateByEmail(email: string, data: { password?: string; isVerified?: boolean }) {
        return prisma.user.update({
            where: { email },
            data,
            select: userSelect,
        })
    },

    async updateStatus(id: number, isActive: boolean) {
        return prisma.user.update({
            where: { id },
            data: { isActive },
            select: userSelect,
        })
    },
}
