import type { IBorrowType } from './IBorrowType'

/**
 * ThesisBorrow — Restricted thesis / research paper borrowing rules.
 *
 * - Due in 3 days
 * - NOT renewable
 * - In-library use only (reference copy — not for take-home)
 */
export class ThesisBorrow implements IBorrowType {
    getDueDays(): number {
        return 3
    }

    isRenewable(): boolean {
        return false
    }

    getDescription(): string {
        return 'Thesis loan: 3 days, not renewable, in-library use only.'
    }

    calculateDueDate(from: Date = new Date()): Date {
        const due = new Date(from)
        due.setDate(due.getDate() + this.getDueDays())
        return due
    }
}
