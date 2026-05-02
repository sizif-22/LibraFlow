import { Elysia } from 'elysia'
import type { AuthUser } from '../types/auth'

export const roleMiddleware = new Elysia()
    .macro(({ onBeforeHandle }) => ({
        hasRole(roles: string[]) {
            onBeforeHandle(({ user, set }: { user: AuthUser | null, set: any }) => {
                if (!user) {
                    set.status = 401
                    return 'Unauthorized'
                }
                
                if (!roles.includes(user.role)) {
                    set.status = 403
                    return 'Forbidden: Insufficient permissions'
                }
            })
        }

    }))
