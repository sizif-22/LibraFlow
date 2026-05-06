import { Elysia, t } from 'elysia'
import { FineService } from '../services/fine.service'
import { authMiddleware } from '../middlewares/auth.middleware'
import { roleMiddleware } from '../middlewares/role.middleware'

export const fineController = new Elysia({ prefix: '/fines' })
    .use(authMiddleware)
    .use(roleMiddleware)

    // POST /api/fines/calculate
    .post('/calculate', async ({ body, error }: any) => {
        try {
            const { borrowId, strategy } = body;
            const fine = await FineService.calculateFineOnReturn(borrowId, strategy);
            return {
                message: 'Fine calculated successfully',
                fine
            };
        } catch (e: any) {
            return error(400, e.message || 'Failed to calculate fine');
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
    .get('/my', async ({ user, error }: any) => {
        try {
            const fines = await FineService.getMyFines(user.id);
            return { fines, total: fines.length };
        } catch (e: any) {
            return error(500, e.message || 'Failed to fetch my fines');
        }
    }, {
        isAuth: true,
        detail: { tags: ['Fines'], summary: 'Student - View my fines' }
    })

    // GET /api/fines
    .get('/', async ({ error }: any) => {
        try {
            const fines = await FineService.getAllFines();
            return { fines, total: fines.length };
        } catch (e: any) {
            return error(500, e.message || 'Failed to fetch all fines');
        }
    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Fines'], summary: 'Librarian - View all fines' }
    })

    // PUT /api/fines/:id/pay
    .put('/:id/pay', async ({ params: { id }, error }: any) => {
        try {
            const fine = await FineService.payFine(parseInt(id));
            return {
                message: 'Fine paid successfully',
                fine
            };
        } catch (e: any) {
            return error(400, e.message || 'Failed to pay fine');
        }
    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        detail: { tags: ['Fines'], summary: 'Librarian - Record fine payment' }
    })
