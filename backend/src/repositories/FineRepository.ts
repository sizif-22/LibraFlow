import prisma from '../db/client'

/**
 * FineRepository — Data access for the Fine model.
 *
 * Sprint 2: stub only — full fine calculation in Sprint 3.
 * Sprint 3 will add: createFine, markAsPaid, getFinesByStudent, etc.
 */
export const FineRepository = {
    /**
     * Check whether a student has at least one unpaid fine.
     * Used by BorrowService to block new borrow requests.
     */
    async hasUnpaidFine(studentId: number): Promise<boolean> {
        const fine = await prisma.fine.findFirst({
            where: {
                studentId,
                isPaid: false,
            },
        })
        return fine !== null
    },

    /**
     * Get all unpaid fines for a student.
     */
    async getUnpaidByStudent(studentId: number) {
        return prisma.fine.findMany({
            where: { studentId, isPaid: false },
            include: {
                borrow: {
                    include: { book: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    },
}
