import prisma from '../db/client'
import { BorrowStatus, BorrowType } from '../types/borrow'

// ─── Shared include shape (reused across all queries) ────────────────────────

const borrowWithRelations = {
    student: {
        select: { id: true, name: true, email: true, role: true },
    },
    book: {
        select: { id: true, title: true, author: true, isbn: true, category: true },
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

    /** All borrows currently in PENDING status — for the librarian dashboard. */
    async findAllPending() {
        return prisma.borrow.findMany({
            where: { status: BorrowStatus.PENDING },
            include: borrowWithRelations,
            orderBy: { createdAt: 'asc' }, // oldest first → FIFO
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
}
