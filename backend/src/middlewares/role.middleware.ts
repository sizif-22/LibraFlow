import { Elysia } from 'elysia'

export const roleMiddleware = new Elysia()
    .macro(({ onBeforeHandle }) => ({
        hasRole(roles: string[]) {
            onBeforeHandle(({ user, error }) => {
                if (!user) return error(401, 'Unauthorized')
                
                // profile from JWT has role property
                if (!roles.includes((user as any).role)) {
                    return error(403, 'Forbidden: Insufficient permissions')
                }
            })
        }
    }))
