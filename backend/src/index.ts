import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { authController } from './controllers/auth.controller'
import { bookController } from './controllers/book.controller'
import { borrowController } from './controllers/borrow.controller'
import { fineController } from './controllers/fine.controller'
import { notificationController } from './controllers/notification.controller'
import { adminController } from './controllers/admin.controller'
import type { AuthUser } from './types/auth'

const app = new Elysia()
    .use(cors())
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET || 'libraflow-secret-key-change-me-in-production'
        })
    )
    .derive(async ({ jwt, headers, path }) => {
        const authorization = headers['authorization'];
        if (!authorization) return { user: null };

        const token = authorization.startsWith('Bearer ') 
            ? authorization.slice(7) 
            : authorization

        const profile = await jwt.verify(token) as AuthUser | false
        return {
            user: profile ? (profile as AuthUser) : null
        }
    })
    .macro(({ onBeforeHandle }) => ({
        isAuth(value: boolean) {
            onBeforeHandle(({ user, set }) => {
                if (value && !user) {
                    set.status = 401;
                    return { message: 'Unauthorized: You must be logged in to access this resource' }
                }
            })
        },
        hasRole(roles: string[]) {
            onBeforeHandle(({ user, set }: any) => {
                if (!user) {
                    set.status = 401
                    return { message: 'Unauthorized' }
                }
                
                if (!roles.includes(user.role)) {
                    set.status = 403
                    return { message: 'Forbidden: Insufficient permissions' }
                }
            })
        }
    }))

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
            .use(notificationController)
            .use(adminController)
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
        
        console.error('[Global Error]', error);
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
