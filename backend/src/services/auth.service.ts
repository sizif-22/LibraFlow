import prisma from '../db/client'
import { hashPassword, comparePassword } from '../utils/password'
import { EmailService } from './email.service'

// Temporary store for verification codes (in-memory)
// In production, use Redis or a database table with TTL
const verificationStore = new Map<string, { code: string, data: any, expires: number }>();
const resetStore = new Map<string, { code: string, expires: number }>();
const activationStore = new Map<string, { code: string, expires: number }>();

export const AuthService = {
    async sendActivationCode(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');
        if (user.isVerified) throw new Error('Account is already verified');

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        activationStore.set(email, { code, expires });
        
        // We can reuse the verification-code template or create a new one
        await EmailService.sendVerificationCode(email, code);
        return { message: 'Activation code sent to email' };
    },

    async activateAccount(email: string, code: string) {
        const entry = activationStore.get(email);
        
        if (!entry) throw new Error('No activation request found');
        if (entry.code !== code) throw new Error('Invalid code');
        if (Date.now() > entry.expires) {
            activationStore.delete(email);
            throw new Error('Code expired');
        }

        const user = await prisma.user.update({
            where: { email },
            data: { isVerified: true }
        });

        activationStore.delete(email);
        return user;
    },
    async sendPasswordResetCode(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('No account found with this email');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        resetStore.set(email, { code, expires });
        
        await EmailService.sendPasswordResetCode(email, code);
        return { message: 'Reset code sent' };
    },

    async resetPassword(email: string, code: string, newPassword: string) {
        const entry = resetStore.get(email);
        
        if (!entry) {
            throw new Error('No password reset requested for this email');
        }

        if (entry.code !== code) {
            throw new Error('Invalid reset code');
        }

        if (Date.now() > entry.expires) {
            resetStore.delete(email);
            throw new Error('Reset code expired');
        }

        const hashedPassword = await hashPassword(newPassword);
        
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        resetStore.delete(email);
        return { message: 'Password reset successful' };
    },
    async sendVerificationCode(email: string, data: any) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        verificationStore.set(email, { code, data, expires });
        
        await EmailService.sendVerificationCode(email, code);
        return { message: 'Verification code sent' };
    },

    async verifyAndRegister(email: string, code: string) {
        const entry = verificationStore.get(email);
        
        if (!entry) {
            throw new Error('No pending registration found for this email');
        }

        if (entry.code !== code) {
            throw new Error('Invalid verification code');
        }

        if (Date.now() > entry.expires) {
            verificationStore.delete(email);
            throw new Error('Verification code expired');
        }

        const { password, name, role } = entry.data;
        const hashedPassword = await hashPassword(password);
        
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role || 'STUDENT',
                isVerified: true
            }
        });

        // Clean up
        verificationStore.delete(email);

        // Send welcome email after successful registration
        await EmailService.sendWelcomeEmail(email, name);

        return user;
    },

    async register(data: any) {
        // This is now legacy or used by admin
        const { email, password, name, role } = data;
        const hashedPassword = await hashPassword(password);
        return await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role || 'STUDENT',
                isVerified: true
            }
        });
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
