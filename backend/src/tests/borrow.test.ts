import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { borrowController } from '../controllers/borrow.controller'

function createApp(user: any) {
    return new Elysia()
        .derive(() => ({ user }))
        .use(borrowController)
}

describe('Borrow Module', () => {
    const studentUser = { id: 1, email: 'student@test.com', role: 'STUDENT' }
    const librarianUser = { id: 2, email: 'lib@test.com', role: 'LIBRARIAN' }

    describe('GET /borrows', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/borrows'))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is not librarian or admin', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/borrows'))
            expect(res.status).toBe(403)
        })

        it('returns borrow list when librarian is authorized', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/borrows'))
            expect(res.status).toBe(200)
        })
    })

    describe('POST /borrows', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: 1 })
                })
            )
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is librarian (must be student)', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: 1 })
                })
            )
            expect(res.status).toBe(403)
        })

        it('returns 422 when body is missing bookId', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                })
            )
            expect(res.status).toBe(422)
        })

        it('returns 422 when bookId is not a number', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: 'abc' })
                })
            )
            expect(res.status).toBe(422)
        })

        it('returns 422 when bookId is less than 1', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: 0 })
                })
            )
            expect(res.status).toBe(422)
        })

        it('creates borrow request for valid student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: 1 })
                })
            )
            expect(res.status).toBe(200)
        })
    })

    describe('GET /borrows/pending', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/borrows/pending'))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/borrows/pending'))
            expect(res.status).toBe(403)
        })

        it('returns pending borrows when librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/borrows/pending'))
            expect(res.status).toBe(200)
        })
    })

    describe('GET /borrows/active', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/borrows/active'))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/borrows/active'))
            expect(res.status).toBe(403)
        })

        it('returns active borrows when librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/borrows/active'))
            expect(res.status).toBe(200)
        })
    })

    describe('GET /borrows/my', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/borrows/my'))
            expect(res.status).toBe(401)
        })

        it('returns borrow history for authenticated user', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/borrows/my'))
            expect(res.status).toBe(200)
        })
    })

    describe('PUT /borrows/:id/approve', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/borrows/1/approve', { method: 'PUT' }))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/borrows/1/approve', { method: 'PUT' }))
            expect(res.status).toBe(403)
        })
    })

    describe('Borrow lifecycle (create -> approve -> return)', () => {
        let createdBorrowId: number

        it('creates a borrow request', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: 1 })
                })
            )
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.message).toContain('submitted')
            expect(body.borrow.status).toBe('PENDING')
            createdBorrowId = body.borrow.id
            expect(createdBorrowId).toBeGreaterThan(0)
        })

        it('approves the created borrow', async () => {
            expect(createdBorrowId).toBeGreaterThan(0)
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request(`http://localhost/borrows/${createdBorrowId}/approve`, { method: 'PUT' })
            )
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.message).toContain('approved')
            expect(body.borrow.status).toBe('APPROVED')
            expect(body.borrow.dueDate).toBeTruthy()
        })

        it('rejects invalid transitions', async () => {
            expect(createdBorrowId).toBeGreaterThan(0)
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request(`http://localhost/borrows/${createdBorrowId}/reject`, { method: 'PUT' })
            )
            expect(res.status).toBe(400)
            const body = await res.json()
            expect(body.message).toContain('Cannot reject')
        })

        it('returns the approved borrow', async () => {
            expect(createdBorrowId).toBeGreaterThan(0)
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request(`http://localhost/borrows/${createdBorrowId}/return`, { method: 'PUT' })
            )
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.message).toContain('returned')
            expect(body.borrow.status).toBe('RETURNED')
            expect(body.borrow.returnDate).toBeTruthy()
        })
    })
})
