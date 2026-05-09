import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { bookController } from '../controllers/book.controller'

function createApp(user: any) {
    return new Elysia()
        .derive(() => ({ user }))
        .use(bookController)
}

describe('Book Module', () => {
    it('should require authentication for listing books', async () => {
        const app = createApp(null)
        const response = await app.handle(
            new Request('http://localhost/books', {
                method: 'GET'
            })
        )
        expect(response.status).toBe(401)
    })

    it('should require authentication for single book view', async () => {
        const app = createApp(null)
        const response = await app.handle(
            new Request('http://localhost/books/1', {
                method: 'GET'
            })
        )
        expect(response.status).toBe(401)
    })

    it('should enforce auth for book creation', async () => {
        const app = createApp(null)
        const response = await app.handle(
            new Request('http://localhost/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: '1234567890123',
                    category: 'Test',
                    quantity: 10
                })
            })
        )
        expect(response.status).toBe(401)
    })

    it('should enforce role check for book creation', async () => {
        const app = createApp({ id: 1, email: 'student@test.com', role: 'STUDENT' })
        const response = await app.handle(
            new Request('http://localhost/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: '1234567890123',
                    category: 'Test',
                    quantity: 10
                })
            })
        )
        const body = await response.json()
        expect(response.status).toBe(403)
        expect(body.message).toContain('Forbidden')
    })

    it('should allow librarian to create books', async () => {
        const ts = Date.now()
        const app = createApp({ id: 2, email: 'lib@test.com', role: 'LIBRARIAN' })
        const response = await app.handle(
            new Request('http://localhost/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Test Book ${ts}`,
                    author: 'Test Author',
                    isbn: `TEST-ISBN-${ts}`,
                    category: 'Test',
                    quantity: 10
                })
            })
        )
        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.title).toBe(`Test Book ${ts}`)
        expect(body.available).toBe(10)
    })

    it('should enforce role check for update and delete', async () => {
        const app = createApp({ id: 1, email: 'student@test.com', role: 'STUDENT' })
        const putRes = await app.handle(
            new Request('http://localhost/books/1', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Updated' })
            })
        )
        expect(putRes.status).toBe(403)

        const delRes = await app.handle(
            new Request('http://localhost/books/1', { method: 'DELETE' })
        )
        expect(delRes.status).toBe(403)
    })
})
