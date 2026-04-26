/**
 * IBorrowType — Contract for all borrow type implementations.
 *
 * Each concrete class (BookBorrow, MagazineBorrow, ThesisBorrow)
 * must implement this interface so BorrowFactory can return them
 * interchangeably.
 */
export interface IBorrowType {
    /** Number of days from approval until the item is due back */
    getDueDays(): number

    /** Whether this borrow type can be renewed after the due date */
    isRenewable(): boolean

    /** Human-readable description of the borrowing rules */
    getDescription(): string

    /** Calculate the actual due Date from a given approval date */
    calculateDueDate(from?: Date): Date
}
