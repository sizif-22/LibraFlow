import prisma from '../db/client'

export const FineRepository = {
    async hasUnpaidFine(studentId: number): Promise<boolean> {
        const fine = await prisma.fine.findFirst({
            where: {
                studentId,
                isPaid: false,
            },
        })
        return fine !== null
    },

    async getUnpaidByStudent(studentId: number) {
        return prisma.fine.findMany({
            where: { studentId, isPaid: false },
            include: {
                borrow: {
                    include: { book: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    },

    async createFine(borrowId: number, studentId: number, amount: number) {
        return prisma.fine.create({
            data: {
                borrowId,
                studentId,
                amount,
                isPaid: false
            }
        })
    },

    async findByStudent(studentId: number) {
        return prisma.fine.findMany({
            where: { studentId },
            include: {
                borrow: {
                    include: { book: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    },

    async markAsPaid(fineId: number) {
        return prisma.fine.update({
            where: { id: fineId },
            data: {
                isPaid: true,
                paidAt: new Date()
            }
        })
    },

    async getTotalCollected() {
        const result = await prisma.fine.aggregate({
            where: { isPaid: true },
            _sum: { amount: true }
        })
        return result._sum.amount || 0
    },

    async getAll() {
        return prisma.fine.findMany({
            include: {
                student: {
                    select: { id: true, name: true, email: true }
                },
                borrow: {
                    include: { book: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    }
}
