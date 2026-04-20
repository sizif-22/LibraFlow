import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authController } from './controllers/auth.controller'
import { bookController } from './controllers/book.controller'

const app = new Elysia()
    .use(cors())
    .get('/ping', () => ({ status: 'ok', message: 'LibraFlow API is running' }))
    .group('/api', (app) => 
        app
            .use(authController)
            .use(bookController)
    )
    .listen(process.env.PORT || 3001)

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)

export type App = typeof app
