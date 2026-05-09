import { Elysia, t } from 'elysia'
import { NotificationService } from '../services/notification.service'

export const notificationController = new Elysia({ prefix: '/notifications' })
    .macro({
        isAuth(value: boolean) {
            return {
                beforeHandle({ user, set }: any) {
                    if (value && !user) {
                        set.status = 401
                        return { message: 'Unauthorized: You must be logged in to access this resource' }
                    }
                }
            }
        },
        hasRole(roles: string[]) {
            return {
                beforeHandle({ user, set }: any) {
                    if (!user) {
                        set.status = 401
                        return { message: 'Unauthorized' }
                    }
                    if (!roles.includes(user.role)) {
                        set.status = 403
                        return { message: 'Forbidden: Insufficient permissions' }
                    }
                }
            }
        }
    })
    .get(
        '/my',
        async ({ user, set }: any) => {
            try {
                const notifications = await NotificationService.getMyNotifications(user.id)
                return { notifications, total: notifications.length }
            } catch (e: any) {
                set.status = 500
                return { message: e.message || 'Failed to fetch notifications' }
            }
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
        async ({ params: { id }, set }: any) => {
            try {
                return await NotificationService.markAsRead(parseInt(id))
            } catch (e: any) {
                set.status = 400
                return { message: e.message || 'Failed to mark notification as read' }
            }
        },
        {
            isAuth: true,
            detail: {
                tags: ['Notifications'],
                summary: 'Mark notification as read',
            },
        }
    )
    .put(
        '/all-read',
        async ({ user, set }: any) => {
            try {
                return await NotificationService.markAllAsRead(user.id)
            } catch (e: any) {
                set.status = 400
                return { message: e.message || 'Failed to mark all notifications as read' }
            }
        },
        {
            isAuth: true,
            detail: {
                tags: ['Notifications'],
                summary: 'Mark all notifications as read',
            },
        }
    )
