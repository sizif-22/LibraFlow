import { NotificationRepository } from '../repositories/NotificationRepository'
import { EmailService } from './email.service'
import { BorrowRepository } from '../repositories/BorrowRepository'
import { NotificationType } from '@prisma/client'

export const NotificationService = {
    async getMyNotifications(studentId: number) {
        return NotificationRepository.findByStudent(studentId)
    },

    async markAsRead(notificationId: number) {
        return NotificationRepository.markAsRead(notificationId)
    },
    
    async markAllAsRead(studentId: number) {
        return NotificationRepository.markAllAsRead(studentId)
    },

    async triggerDueReminders() {
        // Find all borrows due exactly tomorrow
        const dueTomorrow = await BorrowRepository.findDueTomorrow()
        
        const notifications = []
        for (const borrow of dueTomorrow) {
            const message = `Reminder: The book "${borrow.book.title}" is due tomorrow.`
            const notification = await NotificationRepository.create(
                borrow.studentId,
                message,
                NotificationType.DUE_REMINDER
            )
            notifications.push(notification)

            // Send Email Notification
            await EmailService.sendOverdueReminder(
                borrow.student.email,
                borrow.student.name,
                borrow.book.title,
                borrow.dueDate!.toDateString()
            )
        }

        return notifications
    }
}
