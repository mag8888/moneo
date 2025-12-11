import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { BotService } from './bot/bot.service';
import { AuthController } from './auth/auth.controller';
import { GameGateway } from './game/game.gateway';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', AuthController);

// Initialize Bot
const botService = new BotService();
// Initialize Game Gateway
const gameGateway = new GameGateway(io);

app.get('/', (req, res) => {
    res.send('Money Energy Backend is running');
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
