import { EmailService } from './email.service'
import { UserRepository } from '../repositories/UserRepository'
import { BookRepository } from '../repositories/BookRepository'
import { BorrowRepository } from '../repositories/BorrowRepository'
import { FineRepository } from '../repositories/FineRepository'

export const AdminService = {
    async listUsers() {
        return UserRepository.findAll()
    },

    async createUser(data: any) {
        const { email, password, name, role } = data
        const { hashPassword } = await import('../utils/password')
        const hashedPassword = await hashPassword(password)
        const user = await UserRepository.create({
            email,
            name,
            password: hashedPassword,
            role,
            isVerified: false,
            isActive: true,
        })

        // Send Welcome Email
        await EmailService.sendWelcomeEmail(email, name);

        return user;
    },

    async changeUserStatus(userId: number, isActive: boolean) {
        return UserRepository.updateStatus(userId, isActive)
    },

    async getTopBooks() {
        const topBooks = await BorrowRepository.getTopBooks(10)

        const bookIds = topBooks.map((t) => t.bookId)
        const books = await BookRepository.findByIds(bookIds)

        return topBooks.map((t) => {
            const book = books.find((b) => b.id === t.bookId)
            return {
                ...book,
                borrowsCount: t._count.bookId,
            }
        })
    },

    async getOverdueBorrows() {
        return BorrowRepository.findOverdue()
    },

    async getTotalFines() {
        const totalCollected = await FineRepository.getTotalCollected()
        return { totalCollected }
    },

    async getSystemHealth() {
        const connected = await BookRepository.ping()
        return {
            database: connected ? 'connected' : 'disconnected',
            apiGateway: 'online',
            notificationService: 'active',
            timestamp: new Date().toISOString(),
        }
    },

    async getDashboardStats() {
        const [books, pendingBorrows, overdueCount, totalReturned, pendingTodayCount, unpaidFinesData, totalFinesCollected] = await Promise.all([
            BookRepository.getAvailabilityStats(),
            BorrowRepository.getPendingCount(),
            BorrowRepository.getOverdueCount(),
            BorrowRepository.getReturnedCount(),
            BorrowRepository.getDueTodayCount(),
            FineRepository.getUnpaidAccounts(),
            FineRepository.getTotalCollected(),
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
            totalFinesCollected,
        }
    }
}
