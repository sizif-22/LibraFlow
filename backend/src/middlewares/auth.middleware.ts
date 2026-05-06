import { jwt } from '@elysiajs/jwt'
import { Elysia, t } from 'elysia'
import type { AuthUser } from '../types/auth'

export const authMiddleware = new Elysia()
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET || 'libraflow-secret-key-change-me-in-production'
        })
    )
    .derive(async ({ jwt, headers: { authorization } }) => {
        if (!authorization) return { user: null }

        const token = authorization.startsWith('Bearer ') 
            ? authorization.slice(7) 
            : authorization

        const profile = await jwt.verify(token) as AuthUser | false
        if (!profile) return { user: null }

        return {
            user: profile as AuthUser
        }
    })
    .macro(({ onBeforeHandle }) => ({
        isAuth(value: boolean) {
            onBeforeHandle(({ user, error }: { user: AuthUser | null, error: any }) => {
                if (value && !user) {
                    return error(401, {
                        status: 401,
                        message: 'Unauthorized: You must be logged in to access this resource'
                    })
                }
            })
        }
    }))
