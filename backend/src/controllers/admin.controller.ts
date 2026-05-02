import { Elysia, t } from 'elysia'
import { AdminService } from '../services/admin.service'
import { NotificationService } from '../services/notification.service'
import { Role } from '@prisma/client'

export const adminController = new Elysia({ prefix: '/admin' })
    .get('/users', async () => {
        return await AdminService.listUsers()
    }, {
        isAuth: true,
        hasRole: ['ADMIN'],
        detail: {
            tags: ['Admin'],
            summary: 'List all users',
        },
    })
    .put('/users/:id/role', async ({ params: { id }, body, set }: any) => {
        try {
            return await AdminService.changeUserRole(parseInt(id), body.role as Role)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to change role' }
        }
    }, {
        isAuth: true,
        hasRole: ['ADMIN'],
        body: t.Object({
            role: t.String(),
        }),
        detail: {
            tags: ['Admin'],
            summary: 'Change user role',
        },
    })
    .put('/users/:id/status', async ({ params: { id }, body, set }: any) => {
        try {
            return await AdminService.changeUserStatus(parseInt(id), body.isActive)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to change status' }
        }
    }, {
        isAuth: true,
        hasRole: ['ADMIN'],
        body: t.Object({
            isActive: t.Boolean(),
        }),
        detail: {
            tags: ['Admin'],
            summary: 'Activate/Deactivate user',
        },
    })
    .get('/reports/top-books', async () => {
        return await AdminService.getTopBooks()
    }, {
        isAuth: true,
        hasRole: ['ADMIN'],
        detail: {
            tags: ['Admin'],
            summary: 'Get most borrowed books',
        },
    })
    .get('/reports/overdue', async () => {
        return await AdminService.getOverdueBorrows()
    }, {
        isAuth: true,
        hasRole: ['ADMIN'],
        detail: {
            tags: ['Admin'],
            summary: 'Get all overdue borrows',
        },
    })
    .get('/reports/fines', async () => {
        return await AdminService.getTotalFines()
    }, {
        isAuth: true,
        hasRole: ['ADMIN'],
        detail: {
            tags: ['Admin'],
            summary: 'Get total fines collected',
        },
    })
    .post('/reminders/trigger', async () => {
        const notifications = await NotificationService.triggerDueReminders()
        return {
            message: `Sent ${notifications.length} due reminders.`,
            count: notifications.length,
        }
    }, {
        isAuth: true,
        hasRole: ['ADMIN'],
        detail: {
            tags: ['Admin'],
            summary: 'Manually trigger due date reminders',
        },
    })
