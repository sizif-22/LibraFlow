import type { IBorrowType } from './IBorrowType'

/**
 * MagazineBorrow — Short-term magazine borrowing rules.
 *
 * - Due in 7 days
 * - NOT renewable (high demand periodicals)
 * - Can be taken home
 */
export class MagazineBorrow implements IBorrowType {
    getDueDays(): number {
        return 7
    }

    isRenewable(): boolean {
        return false
    }

    getDescription(): string {
        return 'Magazine loan: 7 days, not renewable, take-home allowed.'
    }

    calculateDueDate(from: Date = new Date()): Date {
        const due = new Date(from)
        due.setDate(due.getDate() + this.getDueDays())
        return due
    }
}
