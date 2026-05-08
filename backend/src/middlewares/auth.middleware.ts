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
    .onBeforeHandle(() => {
        if (!process.env.JWT_SECRET) {
            console.error('[AuthMiddleware] WARNING: JWT_SECRET is NOT set in environment variables! Using default fallback.');
        }
    })

    .derive(async ({ jwt, headers, path }) => {
        const authorization = headers['authorization'];
        console.log(`[AuthMiddleware] Request to ${path}. Auth header: ${authorization ? 'Present' : 'Missing'}`);
        
        if (!authorization) {
            return { user: null };
        }

        const token = authorization.startsWith('Bearer ') 
            ? authorization.slice(7) 
            : authorization

        console.log(`[AuthMiddleware] Verifying token: ${token.substring(0, 10)}...`);
        const profile = await jwt.verify(token) as AuthUser | false
        
        if (!profile) {
            console.log('[AuthMiddleware] Verification FAILED');
            return { user: null };
        }

        console.log('[AuthMiddleware] Verification SUCCESS for:', profile.email);
        return {
            user: profile as AuthUser
        }
    })


    .macro(({ onBeforeHandle }) => ({
        isAuth(value: boolean) {
            onBeforeHandle(({ user, set }: { user: AuthUser | null, set: any }) => {
                if (value && !user) {
                    set.status = 401;
                    return {
                        message: 'Unauthorized: You must be logged in to access this resource'
                    }
                }
            })

        }
    }))
