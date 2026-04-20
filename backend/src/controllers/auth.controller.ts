import { Elysia, t } from 'elysia'
import { AuthService } from '../services/auth.service'
import { authMiddleware } from '../middlewares/auth.middleware'

export const authController = new Elysia({ prefix: '/auth' })
    .use(authMiddleware)
    .post('/register', async ({ body, error }) => {
        try {
            const user = await AuthService.register(body)
            return {
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        } catch (e: any) {
            return error(400, e.message || 'Registration failed')
        }
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
            name: t.String(),
            role: t.Optional(t.String())
        })
    })
    .post('/login', async ({ body, jwt, error }) => {
        const user = await AuthService.login(body)
        
        if (!user) {
            return error(401, 'Invalid email or password')
        }

        const token = await jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        })

        return {
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })
