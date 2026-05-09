import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { notificationController } from '../controllers/notification.controller'

function createApp(user: any) {
    return new Elysia()
        .derive(() => ({ user }))
        .use(notificationController)
}

describe('Notification Module', () => {
    const mockUser = { id: 1, email: 'student@test.com', role: 'STUDENT' }

    describe('GET /notifications/my', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/notifications/my'))
            expect(res.status).toBe(401)
        })

        it('returns notifications for authenticated user', async () => {
            const app = createApp(mockUser)
            const res = await app.handle(new Request('http://localhost/notifications/my'))
            expect(res.status).toBe(200)
        })

        it('returns notifications for librarian', async () => {
            const app = createApp({ id: 2, email: 'lib@test.com', role: 'LIBRARIAN' })
            const res = await app.handle(new Request('http://localhost/notifications/my'))
            expect(res.status).toBe(200)
        })
    })

    describe('PUT /notifications/:id/read', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/notifications/1/read', { method: 'PUT' }))
            expect(res.status).toBe(401)
        })

        it('returns 400 when notification does not exist', async () => {
            const app = createApp(mockUser)
            const res = await app.handle(new Request('http://localhost/notifications/99999/read', { method: 'PUT' }))
            expect(res.status).toBe(400)
        })
    })
})
