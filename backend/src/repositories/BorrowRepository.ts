import prisma from '../db/client'
import { BorrowStatus, BorrowType } from '../types/borrow'

// ─── Shared include shape (reused across all queries) ────────────────────────

const borrowWithRelations = {
    student: {
        select: { id: true, name: true, email: true, role: true },
    },
    book: {
        select: { id: true, title: true, author: true, isbn: true, category: true, type: true },
    },
    fine: true,
} as const

/**
 * BorrowRepository — All database operations for the Borrow model.
 *
 * No raw Prisma calls should exist outside this class (Repository Pattern).
 * Controllers and services must go through BorrowRepository for all borrow DB access.
 */
export const BorrowRepository = {
    // ─── Create ──────────────────────────────────────────────────────────────

    /**
     * Create a new borrow request in PENDING status.
     * Due date is set later when the librarian approves.
     */
    async create(studentId: number, bookId: number, type: BorrowType) {
        return prisma.borrow.create({
            data: {
                studentId,
                bookId,
                type,
                status: BorrowStatus.PENDING,
            },
            include: borrowWithRelations,
        })
    },

    // ─── Read ─────────────────────────────────────────────────────────────────

    /** Find a single borrow record by its ID. Returns null if not found. */
    async findById(id: number) {
        return prisma.borrow.findUnique({
            where: { id },
            include: borrowWithRelations,
        })
    },

    /** All borrows in the system — for stats. */
    async findAll() {
        return prisma.borrow.findMany({
            include: borrowWithRelations,
            orderBy: { createdAt: 'desc' },
        })
    },

    /** All borrows currently in PENDING status — for the librarian dashboard. */
    async findAllPending() {
        return prisma.borrow.findMany({
            where: { status: BorrowStatus.PENDING },
            include: borrowWithRelations,
            orderBy: { createdAt: 'asc' }, // oldest first → FIFO
        })
    },

    /** All borrows currently in APPROVED status — for the librarian returns page. */
    async findAllActive() {
        return prisma.borrow.findMany({
            where: { status: BorrowStatus.APPROVED },
            include: borrowWithRelations,
            orderBy: { dueDate: 'asc' }, 
        })
    },

    /** Active (APPROVED) borrows for a given student — shows due dates. */
    async findActiveByStudent(studentId: number) {
        return prisma.borrow.findMany({
            where: {
                studentId,
                status: BorrowStatus.APPROVED,
            },
            include: borrowWithRelations,
            orderBy: { dueDate: 'asc' }, // soonest due first
        })
    },

    /**
     * Full borrow history for a student.
     * Includes PENDING, APPROVED, REJECTED, RETURNED records.
     */
    async findHistoryByStudent(studentId: number) {
        return prisma.borrow.findMany({
            where: { studentId },
            include: borrowWithRelations,
            orderBy: { createdAt: 'desc' }, // newest first
        })
    },

    // ─── Update ───────────────────────────────────────────────────────────────

    /**
     * Update the status of a borrow.
     * When approving, pass dueDate from BorrowFactory.calculateDueDate().
     * When returning, pass returnDate = new Date().
     */
    async updateStatus(
        id: number,
        status: BorrowStatus,
        extra?: { dueDate?: Date; returnDate?: Date }
    ) {
        return prisma.borrow.update({
            where: { id },
            data: {
                status,
                ...(extra?.dueDate     && { dueDate:     extra.dueDate }),
                ...(extra?.returnDate  && { returnDate:  extra.returnDate }),
            },
            include: borrowWithRelations,
        })
    },

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Count how many APPROVED borrows a student currently has for a specific book.
     * Used to prevent duplicate active borrows of the same book.
     */
    async countActiveForBook(studentId: number, bookId: number): Promise<number> {
        return prisma.borrow.count({
            where: {
                studentId,
                bookId,
                status: BorrowStatus.APPROVED,
            },
        })
    },

    // ─── Admin helpers ──────────────────────────────────────────────────────────

    /** Find all overdue borrows (approved + past due date) */
    async findOverdue() {
        const now = new Date()
        return prisma.borrow.findMany({
            where: {
                status: BorrowStatus.APPROVED,
                dueDate: { lt: now },
            },
            include: {
                student: { select: { id: true, name: true, email: true } },
                book: { select: { id: true, title: true, isbn: true } },
            },
            orderBy: { dueDate: 'asc' },
        })
    },

    async getPendingCount(): Promise<number> {
        return prisma.borrow.count({ where: { status: BorrowStatus.PENDING } })
    },

    async getOverdueCount(): Promise<number> {
        const now = new Date()
        return prisma.borrow.count({
            where: {
                status: BorrowStatus.APPROVED,
                dueDate: { lt: now },
            },
        })
    },

    async getReturnedCount(): Promise<number> {
        return prisma.borrow.count({ where: { status: BorrowStatus.RETURNED } })
    },

    async getDueTodayCount(): Promise<number> {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)

        return prisma.borrow.count({
            where: {
                status: BorrowStatus.APPROVED,
                dueDate: { gte: startOfToday, lte: endOfToday },
            },
        })
    },

    /** Get top N most borrowed books */
    async getTopBooks(limit: number = 10) {
        return prisma.borrow.groupBy({
            by: ['bookId'],
            _count: { bookId: true },
            orderBy: { _count: { bookId: 'desc' } },
            take: limit,
        })
    },

    // ─── Transactional operations ───────────────────────────────────────────────

    /**
     * Approve a borrow and decrement book availability in a single transaction.
     * Returns [updatedBorrow] — the book update result is discarded.
     */
    async approveTransaction(borrowId: number, dueDate: Date, bookId: number) {
        return prisma.$transaction([
            prisma.borrow.update({
                where: { id: borrowId },
                data: { status: BorrowStatus.APPROVED, dueDate },
                include: borrowWithRelations,
            }),
            prisma.book.update({
                where: { id: bookId },
                data: { available: { decrement: 1 } },
            }),
        ])
    },

    /**
     * Return a borrow and increment book availability in a single transaction.
     * Returns [updatedBorrow] — the book update result is discarded.
     */
    async returnTransaction(borrowId: number, returnDate: Date, bookId: number) {
        return prisma.$transaction([
            prisma.borrow.update({
                where: { id: borrowId },
                data: { status: BorrowStatus.RETURNED, returnDate },
                include: borrowWithRelations,
            }),
            prisma.book.update({
                where: { id: bookId },
                data: { available: { increment: 1 } },
            }),
        ])
    },

    /** Find all approved borrows due exactly tomorrow */
    async findDueTomorrow() {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        
        const nextDay = new Date(tomorrow)
        nextDay.setDate(nextDay.getDate() + 1)

        return prisma.borrow.findMany({
            where: {
                status: BorrowStatus.APPROVED,
                dueDate: {
                    gte: tomorrow,
                    lt: nextDay,
                },
            },
            include: borrowWithRelations,
        })
    },
}
