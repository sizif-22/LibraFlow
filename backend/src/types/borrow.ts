// ─── Enums (mirror Prisma enums for use in application layer) ─────────────────

export enum BorrowType {
    BOOK     = 'BOOK',
    MAGAZINE = 'MAGAZINE',
    THESIS   = 'THESIS',
}

export enum BorrowStatus {
    PENDING  = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    RETURNED = 'RETURNED',
}

// ─── DTO / Request Shapes ─────────────────────────────────────────────────────

export interface CreateBorrowDto {
    bookId: number
    type: BorrowType
}

// ─── Response Shapes ──────────────────────────────────────────────────────────

export interface BorrowResponse {
    id: number
    studentId: number
    bookId: number
    type: BorrowType
    status: BorrowStatus
    borrowDate: Date
    dueDate: Date | null
    returnDate: Date | null
    createdAt: Date
    updatedAt: Date
}
