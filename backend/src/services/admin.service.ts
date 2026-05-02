import prisma from '../db/client'
import { Role, BorrowStatus } from '@prisma/client'

export const AdminService = {
    async listUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })
    },

    async changeUserRole(userId: number, role: Role) {
        return await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            },
        })
    },

    async changeUserStatus(userId: number, isActive: boolean) {
        return await prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            },
        })
    },

    async getTopBooks() {
        const topBooks = await prisma.borrow.groupBy({
            by: ['bookId'],
            _count: {
                bookId: true,
            },
            orderBy: {
                _count: {
                    bookId: 'desc',
                },
            },
            take: 10,
        })

        const bookIds = topBooks.map((t) => t.bookId)
        const books = await prisma.book.findMany({
            where: { id: { in: bookIds } },
            select: { id: true, title: true, author: true, category: true },
        })

        return topBooks.map((t) => {
            const book = books.find((b) => b.id === t.bookId)
            return {
                ...book,
                borrowsCount: t._count.bookId,
            }
        })
    },

    async getOverdueBorrows() {
        const now = new Date()
        return await prisma.borrow.findMany({
            where: {
                status: BorrowStatus.APPROVED,
                dueDate: {
                    lt: now,
                },
            },
            include: {
                student: { select: { id: true, name: true, email: true } },
                book: { select: { id: true, title: true, isbn: true } },
            },
            orderBy: { dueDate: 'asc' },
        })
    },

    async getTotalFines() {
        const result = await prisma.fine.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                isPaid: true,
            },
        })
        
        return {
            totalCollected: result._sum.amount || 0,
        }
    },
}
