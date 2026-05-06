import prisma from '../db/client'
import { BorrowType, BorrowStatus } from '../types/borrow'
import { BorrowRepository } from '../repositories/BorrowRepository'
import { FineRepository } from '../repositories/FineRepository'
import { BorrowFactory } from '../factories/borrow/BorrowFactory'

/**
 * BorrowService — Business logic for the borrow lifecycle.
 *
 * Connects BorrowRepository + FineRepository + BorrowFactory.
 * Controllers must NOT call repositories or Prisma directly — only this service.
 */
export const BorrowService = {
    // ─── Student actions ─────────────────────────────────────────────────────

    /**
     * US-10: Student requests to borrow a book.
     *
     * Validations:
     *  - Book exists and is available (available > 0)
     *  - Student doesn't already have an active approved borrow for this book
     *  - Student has no unpaid fines (US-19)
     */
    async requestBorrow(studentId: number, bookId: number, type: BorrowType) {
        // 1. Load book
        const book = await prisma.book.findUnique({ where: { id: bookId } })
        if (!book) {
            throw new Error('Book not found')
        }
        if (book.available <= 0) {
            throw new Error('Book is currently not available for borrowing')
        }

        // 2. Check for unpaid fines (US-19)
        const hasFine = await FineRepository.hasUnpaidFine(studentId)
        if (hasFine) {
            throw new Error('You cannot borrow books while you have an unpaid fine')
        }

        // 3. Prevent duplicate active borrow of the same book
        const activeCount = await BorrowRepository.countActiveForBook(studentId, bookId)
        if (activeCount > 0) {
            throw new Error('You already have an active borrow for this book')
        }

        // 4. Create borrow record in PENDING status
        return BorrowRepository.create(studentId, bookId, type)
    },

    /**
     * US-15: Student views their full borrowing history.
     */
    async getMyHistory(studentId: number) {
        return BorrowRepository.findHistoryByStudent(studentId)
    },

    // ─── Librarian actions ───────────────────────────────────────────────────

    /**
     * US-11 + US-12 + US-14: Librarian approves a borrow request.
     *
     * Steps:
     *  1. Validate borrow exists and is PENDING
     *  2. Use BorrowFactory to calculate the due date
     *  3. Update status → APPROVED with the due date
     *  4. Decrement book.available by 1 (US-14)
     */
    async approveBorrow(borrowId: number) {
        const borrow = await BorrowRepository.findById(borrowId)
        if (!borrow) {
            throw new Error('Borrow request not found')
        }
        if (borrow.status !== BorrowStatus.PENDING) {
            throw new Error(`Cannot approve a borrow that is already ${borrow.status}`)
        }

        // Calculate due date using Factory Pattern
        const borrowType = BorrowFactory.create(borrow.type as BorrowType)
        const dueDate = borrowType.calculateDueDate()

        // Run approval + book decrement in a transaction
        const [updatedBorrow] = await prisma.$transaction([
            prisma.borrow.update({
                where: { id: borrowId },
                data: {
                    status: BorrowStatus.APPROVED,
                    dueDate,
                },
                include: {
                    student: { select: { id: true, name: true, email: true, role: true } },
                    book:    { select: { id: true, title: true, author: true, isbn: true, category: true } },
                    fine:    true,
                },
            }),
            prisma.book.update({
                where: { id: borrow.bookId },
                data:  { available: { decrement: 1 } },
            }),
        ])

        return updatedBorrow
    },

    /**
     * US-11: Librarian rejects a borrow request.
     */
    async rejectBorrow(borrowId: number) {
        const borrow = await BorrowRepository.findById(borrowId)
        if (!borrow) {
            throw new Error('Borrow request not found')
        }
        if (borrow.status !== BorrowStatus.PENDING) {
            throw new Error(`Cannot reject a borrow that is already ${borrow.status}`)
        }

        return BorrowRepository.updateStatus(borrowId, BorrowStatus.REJECTED)
    },

    /**
     * US-13 + US-14: Librarian records a book return.
     *
     * Steps:
     *  1. Validate borrow exists and is APPROVED
     *  2. Update status → RETURNED with returnDate = now
     *  3. Increment book.available by 1 (US-14)
     *  (Fine creation for late returns → Sprint 3)
     */
    async returnBook(borrowId: number) {
        const borrow = await BorrowRepository.findById(borrowId)
        if (!borrow) {
            throw new Error('Borrow request not found')
        }
        if (borrow.status !== BorrowStatus.APPROVED) {
            throw new Error(`Cannot return a borrow that has status: ${borrow.status}`)
        }

        const returnDate = new Date()

        // Run return + book increment in a transaction
        const [updatedBorrow] = await prisma.$transaction([
            prisma.borrow.update({
                where: { id: borrowId },
                data: {
                    status: BorrowStatus.RETURNED,
                    returnDate,
                },
                include: {
                    student: { select: { id: true, name: true, email: true, role: true } },
                    book:    { select: { id: true, title: true, author: true, isbn: true, category: true } },
                    fine:    true,
                },
            }),
            prisma.book.update({
                where: { id: borrow.bookId },
                data:  { available: { increment: 1 } },
            }),
        ])

        return updatedBorrow
    },

    /**
     * US-17: Librarian views all pending borrow requests.
     */
    async getPendingRequests() {
        return BorrowRepository.findAllPending()
    },
}
