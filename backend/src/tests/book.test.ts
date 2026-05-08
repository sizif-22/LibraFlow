import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { bookController } from '../controllers/book.controller'

describe('Book Module', () => {
    const app = new Elysia().use(bookController)

    it('should require authentication for listing books', async () => {
        const response = await app.handle(
            new Request('http://localhost/books', {
                method: 'GET'
            })
        )
        
        // This should be 401 Unauthorized because we added isAuth: true
        expect(response.status).toBe(401)
    })

    it('should require authentication for single book view', async () => {
        const response = await app.handle(
            new Request('http://localhost/books/1', {
                method: 'GET'
            })
        )
        
        expect(response.status).toBe(401)
    })

    it('should enforce role check for book creation', async () => {
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
        
        // No token provided, so should be 401
        expect(response.status).toBe(401)
    })
})
