import prisma from '../db/client'
import { BorrowStatus } from '@prisma/client'
import { EmailService } from './email.service'

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

    async createUser(data: any) {
        const { email, password, name, role } = data
        const { hashPassword } = await import('../utils/password')
        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                isActive: true,
                isVerified: false
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            },
        })

        // Send Welcome Email
        await EmailService.sendWelcomeEmail(email, name);

        return user;
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

    async getSystemHealth() {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return {
                database: 'connected',
                apiGateway: 'online',
                notificationService: 'active',
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            return {
                database: 'disconnected',
                apiGateway: 'online',
                notificationService: 'degraded',
                timestamp: new Date().toISOString()
            }
        }
    },

    async getDashboardStats() {
        const now = new Date()
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)

        const [books, pendingBorrows, overdueCount, totalReturned, pendingTodayCount, unpaidFinesData, totalFinesData] = await Promise.all([
            prisma.book.findMany({
                select: {
                    quantity: true,
                    available: true
                }
            }),
            prisma.borrow.count({
                where: { status: BorrowStatus.PENDING }
            }),
            prisma.borrow.count({
                where: {
                    status: BorrowStatus.APPROVED,
                    dueDate: { lt: now }
                }
            }),
            prisma.borrow.count({
                where: { status: BorrowStatus.RETURNED }
            }),
            prisma.borrow.count({
                where: {
                    status: BorrowStatus.APPROVED,
                    dueDate: {
                        gte: startOfToday,
                        lte: endOfToday
                    }
                }
            }),
            prisma.fine.findMany({
                where: { isPaid: false },
                distinct: ['userId'],
                select: { userId: true }
            }),
            prisma.fine.aggregate({
                where: { isPaid: true },
                _sum: { amount: true }
            })
        ])

        const totalVolumes = books.reduce((acc, book) => acc + book.quantity, 0)
        const totalAvailable = books.reduce((acc, book) => acc + book.available, 0)
        const onLoan = totalVolumes - totalAvailable
        
        // Calculate Archive Status: % of books that are NOT on loan
        const archiveStatus = totalVolumes > 0 
            ? Math.round((totalAvailable / totalVolumes) * 100) 
            : 100

        // Mock values for UI display as requested
        const avgResponse = "1.2D" 
        const avgProcessing = "2.4m"

        const health = await this.getSystemHealth()

        return {
            totalVolumes,
            onLoan,
            archiveStatus: `${archiveStatus}%`,
            pendingBorrows,
            totalBooks: books.length,
            avgResponse,
            systemHealth: health.database === 'connected' ? 'Operational' : 'Degraded',
            // Return page specific stats
            pendingToday: pendingTodayCount,
            overdueBooks: overdueCount,
            avgProcessing,
            totalShelved: totalReturned,
            // Fines page stats
            unpaidFinesAccounts: unpaidFinesData.length,
            totalFinesCollected: totalFinesData._sum.amount || 0
        }
    }
}
