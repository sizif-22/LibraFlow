import prisma from '../db/client'

export const BookRepository = {
    async findMany(where: any, pagination: { skip: number; take: number }) {
        return prisma.book.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: { createdAt: 'desc' },
        })
    },

    async count(where: any) {
        return prisma.book.count({ where })
    },

    async findAll(where?: any) {
        return prisma.book.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })
    },

    async findById(id: number) {
        return prisma.book.findUnique({ where: { id } })
    },

    async findByIds(ids: number[]) {
        return prisma.book.findMany({
            where: { id: { in: ids } },
            select: { id: true, title: true, author: true, category: true },
        })
    },

    async create(data: any) {
        return prisma.book.create({
            data: {
                ...data,
                available: data.quantity,
            },
        })
    },

    async update(id: number, data: any) {
        return prisma.book.update({
            where: { id },
            data,
        })
    },

    async delete(id: number) {
        return prisma.book.delete({ where: { id } })
    },

    async getAvailabilityStats() {
        return prisma.book.findMany({
            select: { quantity: true, available: true },
        })
    },

    async decrementAvailable(id: number) {
        return prisma.book.update({
            where: { id },
            data: { available: { decrement: 1 } },
        })
    },

    async incrementAvailable(id: number) {
        return prisma.book.update({
            where: { id },
            data: { available: { increment: 1 } },
        })
    },

    /** Health check — verify database connectivity */
    async ping(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`
            return true
        } catch {
            return false
        }
    },
}
