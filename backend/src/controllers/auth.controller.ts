import { Elysia, t } from 'elysia'
import { AuthService } from '../services/auth.service'

export const authController = new Elysia({ prefix: '/auth' })
    .post('/request-activation', async ({ body, set }) => {
        try {
            return await AuthService.sendActivationCode(body.email)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to send activation code' }
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' })
        })
    })
    .post('/activate', async ({ body, set }) => {
        try {
            const user = await AuthService.activateAccount(body.email, body.code)
            return {
                message: 'Account activated successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified
                }
            }
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Activation failed' }
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            code: t.String({ minLength: 6, maxLength: 6 })
        })
    })
    .post('/forgot-password', async ({ body, set }) => {
        try {
            return await AuthService.sendPasswordResetCode(body.email)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to send reset code' }
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' })
        })
    })
    .post('/reset-password', async ({ body, set }) => {
        try {
            return await AuthService.resetPassword(body.email, body.code, body.newPassword)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to reset password' }
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            code: t.String({ minLength: 6, maxLength: 6 }),
            newPassword: t.String({ minLength: 6 })
        })
    })
    .post('/send-verification', async ({ body, set }) => {
        try {
            return await AuthService.sendVerificationCode(body.email, body)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to send verification code' }
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
    .post('/verify', async ({ body, jwt, set }: any) => {
        try {
            const user = await AuthService.verifyAndRegister(body.email, body.code)
            
            const token = await jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role
            })

            return {
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive
                }
            }
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Verification failed' }
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            code: t.String({ minLength: 6, maxLength: 6 })
        })
    })
    .post('/register', async ({ body, set }) => {
        try {
            const user = await AuthService.register(body)
            return {
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive
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
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive
            }
        }
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })
