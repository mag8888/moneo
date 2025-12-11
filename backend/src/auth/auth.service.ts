import crypto from 'crypto';

export class AuthService {
    constructor() { }

    /**
     * Verifies the Telegram Web App init data.
     * @param initData The raw initData string from Telegram Web App
     * @returns User object if valid, null otherwise
     */
    verifyTelegramAuth(initData: string): any {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) throw new Error("Bot token not configured");

        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');

        if (!hash) return null;

        urlParams.delete('hash');

        const dataCheckString = Array.from(urlParams.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash === hash) {
            // Valid
            const userStr = urlParams.get('user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        }
        return null;
    }
}
