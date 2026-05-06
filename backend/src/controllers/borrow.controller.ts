import { Elysia, t } from 'elysia'
import { BorrowService } from '../services/borrow.service'
import { authMiddleware } from '../middlewares/auth.middleware'
import { roleMiddleware } from '../middlewares/role.middleware'
import { BorrowType } from '../types/borrow'

export const borrowController = new Elysia({ prefix: '/borrows' })
    .use(authMiddleware)
    .use(roleMiddleware)

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/borrows
    // US-10: Student requests to borrow a book
    // ─────────────────────────────────────────────────────────────────────────
    .post('/', async ({ body, user, error }: any) => {
        try {
            const borrow = await BorrowService.requestBorrow(
                user.id,
                body.bookId,
                body.type as BorrowType
            )
            return {
                message: 'Borrow request submitted successfully',
                borrow,
            }
        } catch (e: any) {
            return error(400, e.message || 'Failed to submit borrow request')
        }
    }, {
        isAuth: true,
        hasRole: ['STUDENT'],
        detail: { tags: ['Borrows'], summary: 'Student — Request to borrow a book' },
        body: t.Object({
            bookId: t.Number({ minimum: 1 }),
            type: t.Enum({
                BOOK:     'BOOK',
                MAGAZINE: 'MAGAZINE',
                THESIS:   'THESIS',
            }),
        }),
    })

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/borrows/pending
    // US-17: Librarian views all pending requests
    // ─────────────────────────────────────────────────────────────────────────
    .get('/pending', async ({ error }: any) => {
        try {
            const borrows = await BorrowService.getPendingRequests()
            return { borrows, total: borrows.length }
        } catch (e: any) {
            return error(500, e.message || 'Failed to fetch pending requests')
        }
    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Borrows'], summary: 'Librarian — View all pending borrow requests' },
    })

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/borrows/my
    // US-15: Student views their own borrowing history
    // ─────────────────────────────────────────────────────────────────────────
    .get('/my', async ({ user, error }: any) => {
        try {
            const borrows = await BorrowService.getMyHistory(user.id)
            return { borrows, total: borrows.length }
        } catch (e: any) {
            return error(500, e.message || 'Failed to fetch borrow history')
        }
    }, {
        isAuth: true,
        detail: { tags: ['Borrows'], summary: 'Student — View my borrow history' },
    })

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/borrows/:id/approve
    // US-11 + US-12 + US-14: Librarian approves a request → sets due date + decrements stock
    // ─────────────────────────────────────────────────────────────────────────
    .put('/:id/approve', async ({ params: { id }, error }: any) => {
        try {
            const borrow = await BorrowService.approveBorrow(parseInt(id))
            return {
                message: 'Borrow request approved successfully',
                borrow,
            }
        } catch (e: any) {
            return error(400, e.message || 'Failed to approve borrow request')
        }
    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Borrows'], summary: 'Librarian — Approve a borrow request' },
    })

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/borrows/:id/reject
    // US-11: Librarian rejects a request
    // ─────────────────────────────────────────────────────────────────────────
    .put('/:id/reject', async ({ params: { id }, error }: any) => {
        try {
            const borrow = await BorrowService.rejectBorrow(parseInt(id))
            return {
                message: 'Borrow request rejected',
                borrow,
            }
        } catch (e: any) {
            return error(400, e.message || 'Failed to reject borrow request')
        }
    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Borrows'], summary: 'Librarian — Reject a borrow request' },
    })

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/borrows/:id/return
    // US-13 + US-14: Librarian records a return → increments stock
    // ─────────────────────────────────────────────────────────────────────────
    .put('/:id/return', async ({ params: { id }, error }: any) => {
        try {
            const borrow = await BorrowService.returnBook(parseInt(id))
            return {
                message: 'Book returned successfully',
                borrow,
            }
        } catch (e: any) {
            return error(400, e.message || 'Failed to record book return')
        }
    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Borrows'], summary: 'Librarian — Record a book return' },
    })
