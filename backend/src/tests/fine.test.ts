import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { fineController } from '../controllers/fine.controller'

function createApp(user: any) {
    return new Elysia()
        .derive(() => ({ user }))
        .use(fineController)
}

describe('Fine Module', () => {
    const studentUser = { id: 1, email: 'student@test.com', role: 'STUDENT' }
    const librarianUser = { id: 2, email: 'lib@test.com', role: 'LIBRARIAN' }

    describe('POST /fines/calculate', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ borrowId: 1 })
                })
            )
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ borrowId: 1 })
                })
            )
            expect(res.status).toBe(403)
        })

        it('returns 422 when borrowId is missing', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                })
            )
            expect(res.status).toBe(422)
        })

        it('returns 422 when borrowId is not a number', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ borrowId: 'abc' })
                })
            )
            expect(res.status).toBe(422)
        })

        it('calculates fine for returned borrow when librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ borrowId: 1, strategy: 'PER_DAY' })
                })
            )
            expect(res.status).toBe(200)
        })

        it('accepts optional strategy parameter', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ borrowId: 1, strategy: 'FIXED' })
                })
            )
            expect(res.status).toBe(200)
        })
    })

    describe('GET /fines/my', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/fines/my'))
            expect(res.status).toBe(401)
        })

        it('returns fines for authenticated user', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/fines/my'))
            expect(res.status).toBe(200)
        })

        it('returns fines for librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/fines/my'))
            expect(res.status).toBe(200)
        })
    })

    describe('GET /fines', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/fines'))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/fines'))
            expect(res.status).toBe(403)
        })

        it('returns all fines when librarian', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/fines'))
            expect(res.status).toBe(200)
        })
    })

    describe('PUT /fines/:id/pay', () => {
        it('returns 401 when not authenticated', async () => {
            const app = createApp(null)
            const res = await app.handle(new Request('http://localhost/fines/1/pay', { method: 'PUT' }))
            expect(res.status).toBe(401)
        })

        it('returns 403 when user is student', async () => {
            const app = createApp(studentUser)
            const res = await app.handle(new Request('http://localhost/fines/1/pay', { method: 'PUT' }))
            expect(res.status).toBe(403)
        })

        it('returns 400 when fine does not exist', async () => {
            const app = createApp(librarianUser)
            const res = await app.handle(new Request('http://localhost/fines/1/pay', { method: 'PUT' }))
            expect(res.status).toBe(400)
        })
    })
})
