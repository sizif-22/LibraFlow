import type { IBorrowType } from './IBorrowType'

/**
 * BookBorrow — Standard book borrowing rules.
 *
 * - Due in 14 days
 * - Renewable once
 * - Can be taken home
 */
export class BookBorrow implements IBorrowType {
    getDueDays(): number {
        return 14
    }

    isRenewable(): boolean {
        return true
    }

    getDescription(): string {
        return 'Standard book loan: 14 days, renewable once, take-home allowed.'
    }

    calculateDueDate(from: Date = new Date()): Date {
        const due = new Date(from)
        due.setDate(due.getDate() + this.getDueDays())
        return due
    }
}
