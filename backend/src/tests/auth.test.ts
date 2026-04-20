import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { authController } from '../controllers/auth.controller'

describe('Auth Module', () => {
    const app = new Elysia().use(authController)

    it('should validate registration input', async () => {
        const response = await app.handle(
            new Request('http://localhost/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invalid-email',
                    password: '123',
                    name: 'S'
                })
            })
        )
        
        expect(response.status).toBe(422)
    })

    it('should prevent login with invalid credentials', async () => {
        const response = await app.handle(
            new Request('http://localhost/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                })
            })
        )
        
        expect(response.status).toBe(401)
    })
})
