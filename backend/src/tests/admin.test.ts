import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { adminController } from '../controllers/admin.controller'

function createApp(user: any) {
    return new Elysia()
        .derive(() => ({ user }))
        .use(adminController)
}

describe('Admin Module', () => {
    const studentUser = { id: 1, email: 'student@test.com', role: 'STUDENT' }
    const librarianUser = { id: 2, email: 'lib@test.com', role: 'LIBRARIAN' }
    const adminUser = { id: 3, email: 'admin@test.com', role: 'ADMIN' }

    describe('GET /admin/users', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/admin/users'))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/admin/users'))
            expect(res.status).toBe(403)
        })

        it('returns 403 when user is librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/admin/users'))
            expect(res.status).toBe(403)
        })

        it('returns user list when admin is authorized', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(new Request('http://localhost/admin/users'))
            expect(res.status).toBe(200)
        })
    })

    describe('POST /admin/users', () => {
        const ts = Date.now()
        const validBody = { name: 'New User', email: `admin-test-${ts}@test.com`, password: 'password123', role: 'STUDENT' }

        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(
                new Request('http://localhost/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validBody)
                })
            )
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validBody)
                })
            )
            expect(res.status).toBe(403)
        })

        it('creates user successfully when admin', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(
                new Request('http://localhost/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validBody)
                })
            )
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.name).toBe('New User')
            expect(body.email).toBe(validBody.email)
            expect(body.role).toBe('STUDENT')
            expect(body.isActive).toBe(true)
        })
    })

    describe('PUT /admin/users/:id/status', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(
                new Request('http://localhost/admin/users/1/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: false })
                })
            )
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(
                new Request('http://localhost/admin/users/1/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: false })
                })
            )
            expect(res.status).toBe(403)
        })

        it('returns 422 when isActive is missing', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(
                new Request('http://localhost/admin/users/1/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                })
            )
            expect(res.status).toBe(422)
        })

        it('returns 422 when isActive is not a boolean', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(
                new Request('http://localhost/admin/users/1/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: 'yes' })
                })
            )
            expect(res.status).toBe(422)
        })

        it('updates user status successfully', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(
                new Request('http://localhost/admin/users/1/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: false })
                })
            )
            expect(res.status).toBe(200)
        })
    })

    describe('GET /admin/reports/top-books', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/admin/reports/top-books'))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/admin/reports/top-books'))
            expect(res.status).toBe(403)
        })

        it('returns top books report when admin', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(new Request('http://localhost/admin/reports/top-books'))
            expect(res.status).toBe(200)
        })
    })

    describe('GET /admin/reports/overdue', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/admin/reports/overdue'))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/admin/reports/overdue'))
            expect(res.status).toBe(403)
        })

        it('returns overdue report when admin', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(new Request('http://localhost/admin/reports/overdue'))
            expect(res.status).toBe(200)
        })
    })

    describe('GET /admin/reports/fines', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/admin/reports/fines'))
            expect(res.status).toBe(401)
        })

        it('returns fines total when admin', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(new Request('http://localhost/admin/reports/fines'))
            expect(res.status).toBe(200)
        })
    })

    describe('POST /admin/reminders/trigger', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/admin/reminders/trigger', { method: 'POST' }))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/admin/reminders/trigger', { method: 'POST' }))
            expect(res.status).toBe(403)
        })

        it('triggers reminders successfully when admin', async () => {
            const app = createApp(adminUser)
            const res = await app.handle(new Request('http://localhost/admin/reminders/trigger', { method: 'POST' }))
            expect(res.status).toBe(200)
        })
    })
})
