import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';

const router = Router();
const authService = new AuthService();

router.post('/login/telegram', (req: Request, res: Response) => {
    try {
        const { initData } = req.body;
        if (!initData) {
            return res.status(400).json({ error: "Missing initData" });
        }

        const user = authService.verifyTelegramAuth(initData);

        if (!user) {
            return res.status(401).json({ error: "Invalid Telegram credentials" });
        }

        // TODO: Find or Create user in Database
        // For now, return the user info and a mock token

        console.log("User logged in:", user.first_name, user.id);

        return res.json({
            token: "mock-jwt-token-for-" + user.id,
            user: {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                photoUrl: user.photo_url
            }
        });

    } catch (error) {
        console.error("Auth error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export const AuthController = router;
