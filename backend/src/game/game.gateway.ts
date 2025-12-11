import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { GameEngine } from './engine';

export class GameGateway {
    private io: Server;
    private roomService: RoomService;
    private games: Map<string, GameEngine> = new Map();

    constructor(io: Server) {
        this.io = io;
        this.roomService = new RoomService();
        this.initGames(); // Restore games from DB
        this.initEvents();
    }

    async initGames() {
        // Restore active games from DB on server restart
        const activeRooms = await this.roomService.getActiveGames();
        console.log(`Restoring ${activeRooms.length} active games...`);
        for (const room of activeRooms) {
            if (room.gameState) {
                const engine = new GameEngine(room.id, room.players);
                // We need a way to hydration the engine with existing state. 
                // Since GameEngine doesn't have setState, we might need to add it or hack it.
                // Or just constructor should check if we can pass state.
                // For now, let's assume we can assign it (or I'll add a method to Engine next).
                Object.assign(engine.state, room.gameState);
                this.games.set(room.id, engine);
                console.log(`Restored game ${room.id} (Turn: ${room.gameState.currentTurnTime})`);
            }
        }
    }

    initEvents() {
        this.io.on('connection', (socket: Socket) => {
            // ... (existing connection logic)
            // ...

            // Game Actions - Helper to save state
            const saveState = (roomId: string, game: GameEngine) => {
                this.roomService.saveGameState(roomId, game.getState()).catch(err => console.error("Persist Error:", err));
            };

            socket.on('roll_dice', ({ roomId }) => {
                const game = this.games.get(roomId);
                if (game) {
                    const roll = game.rollDice();
                    const state = game.getState();
                    this.io.to(roomId).emit('dice_rolled', { roll, state });
                    saveState(roomId, game);
                }
            });

            socket.on('take_loan', ({ roomId, amount }) => {
                const game = this.games.get(roomId);
                if (game) {
                    try {
                        game.takeLoan(socket.id, amount);
                        const state = game.getState();
                        this.io.to(roomId).emit('state_updated', { state });
                        saveState(roomId, game);
                    } catch (e: any) {
                        socket.emit('error', e.message);
                    }
                }
            });

            socket.on('repay_loan', ({ roomId, amount }) => {
                const game = this.games.get(roomId);
                if (game) {
                    try {
                        game.repayLoan(socket.id, amount);
                        const state = game.getState();
                        this.io.to(roomId).emit('state_updated', { state });
                        saveState(roomId, game);
                    } catch (e: any) {
                        socket.emit('error', e.message);
                    }
                }
            });

            socket.on('transfer_funds', ({ roomId, toId, amount }) => {
                const game = this.games.get(roomId);
                if (game) {
                    try {
                        game.transferFunds(socket.id, toId, amount);
                        const state = game.getState();
                        this.io.to(roomId).emit('state_updated', { state });
                        saveState(roomId, game);
                    } catch (e: any) {
                        socket.emit('error', e.message);
                    }
                }
            });

            socket.on('buy_asset', ({ roomId }) => {
                const game = this.games.get(roomId);
                if (game) {
                    try {
                        game.buyAsset(socket.id);
                        const state = game.getState();
                        this.io.to(roomId).emit('state_updated', { state });
                        saveState(roomId, game);
                    } catch (e: any) {
                        socket.emit('error', e.message);
                    }
                }
            });

            socket.on('end_turn', ({ roomId }) => {
                const game = this.games.get(roomId);
                if (game) {
                    game.endTurn();
                    const state = game.getState();
                    this.io.to(roomId).emit('turn_ended', { state });
                    saveState(roomId, game);
                }
            });

            socket.on('disconnect', () => {
                // Handle unclean disconnects (find which room they were in?)
                // Complexe without user mapping. For now, rely on explicit leave or timeout.
                console.log('Client disconnected:', socket.id);
            });
        });
    }
}
