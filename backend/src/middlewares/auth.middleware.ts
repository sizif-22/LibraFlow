import { jwt } from '@elysiajs/jwt'
import { Elysia, t } from 'elysia'

export const authMiddleware = new Elysia()
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET || 'libraflow-secret-key'
        })
    )
    .derive(async ({ jwt, headers: { authorization } }) => {
        if (!authorization) return { user: null }

        const token = authorization.startsWith('Bearer ') 
            ? authorization.slice(7) 
            : authorization

        const profile = await jwt.verify(token)
        if (!profile) return { user: null }

        return {
            user: profile
        }
    })
    .macro(({ onBeforeHandle }) => ({
        isAuth(value: boolean) {
            onBeforeHandle(({ user, error }) => {
                if (value && !user) return error(401, 'Unauthorized')
            })
        }
    }))
