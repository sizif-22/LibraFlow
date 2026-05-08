import { Elysia, t } from 'elysia'
import { NotificationService } from '../services/notification.service'
import { authMiddleware } from '../middlewares/auth.middleware'

export const notificationController = new Elysia({ prefix: '/notifications' })
    .use(authMiddleware)
    .get(
        '/my',
        async ({ user }: any) => {
            return await NotificationService.getMyNotifications(user.id)
        },
        {
            isAuth: true,
            detail: {
                tags: ['Notifications'],
                summary: 'Get my notifications',
            },
        }
    )
    .put(
        '/:id/read',
        async ({ params: { id } }: any) => {
            return await NotificationService.markAsRead(parseInt(id))
        },
        {
            isAuth: true,
            detail: {
                tags: ['Notifications'],
                summary: 'Mark notification as read',
            },
        }
    )
