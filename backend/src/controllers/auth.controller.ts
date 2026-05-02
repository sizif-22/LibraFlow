import { Elysia, t } from 'elysia'
import { AuthService } from '../services/auth.service'

export const authController = new Elysia({ prefix: '/auth' })
    .post('/register', async ({ body, set }) => {
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
            set.status = 400
            return { message: e.message || 'Registration failed' }
        }

    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 }),
            name: t.String({ minLength: 2 }),
            role: t.Optional(t.Enum({
                STUDENT: 'STUDENT',
                LIBRARIAN: 'LIBRARIAN',
                ADMIN: 'ADMIN'
            }))
        })
    })
    .post('/login', async ({ body, jwt, set }: any) => {
        const user = await AuthService.login(body)
        
        if (!user) {
            set.status = 401
            return { message: 'Invalid email or password' }
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
