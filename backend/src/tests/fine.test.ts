import { describe, it, expect, beforeAll } from 'bun:test'
import { Elysia } from 'elysia'
import { fineController } from '../controllers/fine.controller'
import { borrowController } from '../controllers/borrow.controller'

function createApp(user: any, controller?: any) {
    return new Elysia()
        .derive(() => ({ user }))
        .use(controller || fineController)
}

describe('Fine Module', () => {
    const studentUser = { id: 1, email: 'student@test.com', role: 'STUDENT' }
    const librarianUser = { id: 2, email: 'lib@test.com', role: 'LIBRARIAN' }

    describe('POST /fines/calculate', () => {
        let returnedBorrowId: number

        beforeAll(async () => {
            const borrowApp = new Elysia()
                .derive(() => ({ user: studentUser }))
                .use(borrowController)
            const createRes = await borrowApp.handle(
                new Request('http://localhost/borrows', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: 1 })
                })
            )
            const createBody = await createRes.json()
            const borrowId = createBody.borrow?.id

            const approveApp = new Elysia()
                .derive(() => ({ user: librarianUser }))
                .use(borrowController)
            await approveApp.handle(
                new Request(`http://localhost/borrows/${borrowId}/approve`, { method: 'PUT' })
            )

            const returnApp = new Elysia()
                .derive(() => ({ user: librarianUser }))
                .use(borrowController)
            const returnRes = await returnApp.handle(
                new Request(`http://localhost/borrows/${borrowId}/return`, { method: 'PUT' })
            )
            const returnBody = await returnRes.json()
            returnedBorrowId = returnBody.borrow?.id || borrowId
        })

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
            expect(returnedBorrowId).toBeGreaterThan(0)
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ borrowId: returnedBorrowId, strategy: 'PER_DAY' })
                })
            )
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.message).toContain('Fine calculated')
        })

        it('accepts optional strategy parameter', async () => {
            expect(returnedBorrowId).toBeGreaterThan(0)
            const app = createApp(librarianUser)
            const res = await app.handle(
                new Request('http://localhost/fines/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ borrowId: returnedBorrowId, strategy: 'FIXED' })
                })
            )
            expect(res.status).toBe(200)
            const body = await res.json()
            expect(body.message).toContain('Fine calculated')
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
