import prisma from '../db/client'
import { hashPassword, comparePassword } from '../utils/password'

export const AuthService = {
    async register(data: any) {
        const { email, password, name, role } = data
        
        const hashedPassword = await hashPassword(password)
        
        return await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role || 'STUDENT'
            }
        })
    },

    async login(data: any) {
        const { email, password } = data
        
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) return null

        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) return null

        return user
    }
}
