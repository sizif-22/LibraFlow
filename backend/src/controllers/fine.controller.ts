import { Elysia, t } from 'elysia'
import { FineService } from '../services/fine.service'

export const fineController = new Elysia({ prefix: '/fines' })

    // POST /api/fines/calculate
    .post('/calculate', async ({ body, set }: any) => {
        try {
            const { borrowId, strategy } = body;
            const fine = await FineService.calculateFineOnReturn(borrowId, strategy);
            return {
                message: 'Fine calculated successfully',
                fine
            };
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to calculate fine' };
        }

    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Fines'], summary: 'System/Librarian - Auto calculate fine on return' },
        body: t.Object({
            borrowId: t.Number(),
            strategy: t.Optional(t.String()) // 'PER_DAY', 'FIXED', 'PERCENTAGE'
        })
    })

    // GET /api/fines/my
    .get('/my', async ({ user, set }: any) => {
        try {
            const fines = await FineService.getMyFines(user.id);
            return { fines, total: fines.length };
        } catch (e: any) {
            set.status = 500;
            return { message: e.message || 'Failed to fetch my fines' };
        }

    }, {
        isAuth: true,
        detail: { tags: ['Fines'], summary: 'Student - View my fines' }
    })

    // GET /api/fines
    .get('/', async ({ set }: any) => {
        try {
            const fines = await FineService.getAllFines();
            return { fines, total: fines.length };
        } catch (e: any) {
            set.status = 500
            return { message: e.message || 'Failed to fetch all fines' };
        }

    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Fines'], summary: 'Librarian - View all fines' }
    })

    // PUT /api/fines/:id/pay
    .put('/:id/pay', async ({ params: { id }, set }: any) => {
        try {
            const fine = await FineService.payFine(parseInt(id));
            return {
                message: 'Fine paid successfully',
                fine
            };
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to pay fine' };
        }

    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Fines'], summary: 'Librarian - Record fine payment' }
    })
