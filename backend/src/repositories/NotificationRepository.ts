import { NotificationType } from '@prisma/client'
import prisma from '../db/client'

export const NotificationRepository = {
    async create(studentId: number, message: string, type: NotificationType) {
        return await prisma.notification.create({
            data: {
                studentId,
                message,
                type,
            },
        })
    },

    async findByStudent(studentId: number) {
        return await prisma.notification.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        })
    },

    async markAsRead(notificationId: number) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        })
    },
}
