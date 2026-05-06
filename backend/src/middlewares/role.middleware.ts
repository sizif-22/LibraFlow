import { Elysia } from 'elysia'
import type { AuthUser } from '../types/auth'

export const roleMiddleware = new Elysia()
    .macro(({ onBeforeHandle }) => ({
        hasRole(roles: string[]) {
            onBeforeHandle(({ user, error }: { user: AuthUser | null, error: any }) => {
                if (!user) return error(401, 'Unauthorized')
                
                if (!roles.includes(user.role)) {
                    return error(403, 'Forbidden: Insufficient permissions')
                }
            })
        }
    }))
