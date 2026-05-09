import fs from 'fs/promises';
import path from 'path';

const ZEPTO_MAIL_URL = process.env.ZEPTO_MAIL_URL || "";
const ZEPTO_MAIL_TOKEN = process.env.ZEPTO_MAIL_TOKEN || "";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "";
const SENDER_NAME = process.env.SENDER_NAME || "";

export const EmailService = {
    async sendEmail(to: string, subject: string, templateName: string, data: Record<string, string>) {
        console.log(`[EmailService] Attempting to send "${templateName}" email to: ${to}`);
        try {
            // Load template
            const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.html`);
            let htmlContent = await fs.readFile(templatePath, 'utf-8');

            // Replace placeholders {{key}} with data[key]
            Object.entries(data).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                htmlContent = htmlContent.replace(regex, value);
            });

            const payload = {
                from: {
                    address: SENDER_EMAIL,
                    name: SENDER_NAME
                },
                to: [
                    {
                        email_address: {
                            address: to,
                            name: data.name || to
                        }
                    }
                ],
                subject: subject,
                htmlbody: htmlContent
            };

            const response = await fetch(ZEPTO_MAIL_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': ZEPTO_MAIL_TOKEN
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('ZeptoMail Error:', error);
                throw new Error('Failed to send email');
            }

            console.log(`[EmailService] Email sent successfully to: ${to} (Subject: ${subject})`);
            return await response.json();
        } catch (error) {
            console.error('Email Service Error:', error);
            // We don't want to break the main flow if email fails
            return null;
        }
    },

    async sendWelcomeEmail(to: string, name: string) {
        console.log(`[EmailService] Triggering Welcome Email for: ${name}`);
        return this.sendEmail(to, 'Welcome to LibraFlow', 'welcome', {
            name,
            email: to,
            loginUrl: 'http://localhost:3000/login' // In production this would be an env var
        });
    },

    async sendBorrowConfirmation(to: string, name: string, bookTitle: string, dueDate: string) {
        return this.sendEmail(to, `Borrowed: ${bookTitle}`, 'borrow-confirmation', {
            name,
            bookTitle,
            dueDate
        });
    },

    async sendReturnConfirmation(to: string, name: string, bookTitle: string) {
        return this.sendEmail(to, `Returned: ${bookTitle}`, 'return-confirmation', {
            name,
            bookTitle,
            returnDate: new Date().toLocaleDateString()
        });
    },

    async sendOverdueReminder(to: string, name: string, bookTitle: string, dueDate: string) {
        return this.sendEmail(to, `URGENT: Overdue Book - ${bookTitle}`, 'overdue-reminder', {
            name,
            bookTitle,
            dueDate
        });
    },

    async sendFineNotification(to: string, name: string, bookTitle: string, amount: string) {
        console.log(`[EmailService] Triggering Fine Notification for: ${name} (Amount: ${amount})`);
        return this.sendEmail(to, `Fine Issued: ${amount} EGP`, 'fine-added', {
            name,
            bookTitle,
            amount
        });
    },

    async sendVerificationCode(to: string, code: string) {
        console.log(`[EmailService] Triggering Verification Code for: ${to}`);
        return this.sendEmail(to, 'Your Verification Code', 'verification-code', {
            code
        });
    },

    async sendPasswordResetCode(to: string, code: string) {
        console.log(`[EmailService] Triggering Password Reset Code for: ${to}`);
        return this.sendEmail(to, 'Reset Your Password', 'reset-password', {
            code
        });
    }
};
