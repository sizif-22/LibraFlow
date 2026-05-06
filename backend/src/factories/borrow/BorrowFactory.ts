import { BorrowType } from '../../types/borrow'
import type { IBorrowType } from './IBorrowType'
import { BookBorrow } from './BookBorrow'
import { MagazineBorrow } from './MagazineBorrow'
import { ThesisBorrow } from './ThesisBorrow'

/**
 * BorrowFactory — Factory Pattern implementation.
 *
 * Usage:
 *   const borrowType = BorrowFactory.create(BorrowType.BOOK)
 *   const dueDate    = borrowType.calculateDueDate()
 *
 * Adding a new borrow type in the future:
 *   1. Create a class that implements IBorrowType
 *   2. Add the value to the BorrowType enum in Prisma + types/borrow.ts
 *   3. Add a case here — no other files need to change (Open/Closed Principle)
 */
export class BorrowFactory {
    static create(type: BorrowType): IBorrowType {
        switch (type) {
            case BorrowType.BOOK:
                return new BookBorrow()

            case BorrowType.MAGAZINE:
                return new MagazineBorrow()

            case BorrowType.THESIS:
                return new ThesisBorrow()

            default:
                // TypeScript exhaustiveness check — should never reach here
                throw new Error(`Unknown borrow type: ${type}`)
        }
    }
}
