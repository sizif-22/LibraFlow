import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { authController } from './controllers/auth.controller'
import { bookController } from './controllers/book.controller'
import { borrowController } from './controllers/borrow.controller'
import { fineController } from './controllers/fine.controller'

const app = new Elysia()
    .use(cors())
    .use(swagger({
        documentation: {
            info: {
                title: 'LibraFlow API',
                version: '1.0.0',
                description: 'University Library Management System API Documentation'
            },
            tags: [
                { name: 'Auth',   description: 'Authentication endpoints' },
                { name: 'Books',  description: 'Book management endpoints' },
                { name: 'Borrows', description: 'Borrowing system endpoints' },
                { name: 'Fines',   description: 'Fine calculation and management endpoints' }
            ]
        }
    }))
    .get('/ping', () => ({ status: 'ok', message: 'LibraFlow API is running' }))
    .group('/api', (app) => 
        app
            .use(authController)
            .use(bookController)
            .use(borrowController)
            .use(fineController)
    )
    .onError(({ code, error, set }) => {
        if (code === 'NOT_FOUND') {
            set.status = 404
            return { status: 404, message: 'Not Found' }
        }
        if (code === 'VALIDATION') {
            set.status = 422
            return { status: 422, message: (error as any).message, error: (error as any).validator }
        }
        
        set.status = 500
        return {
            status: 500,
            message: (error as any).message || 'Internal Server Error'
        }
    })
    .listen(process.env.PORT || 3001)

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)

export type App = typeof app
