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
        this.initEvents();
    }

    initEvents() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            // Get available rooms
            socket.on('get_rooms', (callback) => {
                callback(this.roomService.getRooms());
            });

            // Create Room
            socket.on('create_room', (data, callback) => {
                try {
                    const { name, maxPlayers, timer, password, playerName } = data;
                    const room = this.roomService.createRoom(
                        socket.id,
                        playerName || 'Player',
                        name,
                        maxPlayers,
                        timer,
                        password
                    );
                    socket.join(room.id);
                    this.io.emit('rooms_updated', this.roomService.getRooms()); // Broadcast update
                    callback({ success: true, room });
                } catch (e: any) {
                    callback({ success: false, error: e.message });
                }
            });

            // Join Room
            socket.on('join_room', (data, callback) => {
                try {
                    const { roomId, password, playerName } = data;
                    const room = this.roomService.joinRoom(roomId, socket.id, playerName || 'Player', password);
                    socket.join(roomId);
                    this.io.to(roomId).emit('room_state_updated', room);
                    // Also broadcast to lobby that room headcount changed
                    this.io.emit('rooms_updated', this.roomService.getRooms());
                    callback({ success: true, room });
                } catch (e: any) {
                    callback({ success: false, error: e.message });
                }
            });

            // Leave Room
            socket.on('leave_room', (data) => {
                const { roomId } = data;
                this.roomService.leaveRoom(roomId, socket.id);
                socket.leave(roomId);
                const room = this.roomService.getRoom(roomId);
                if (room) {
                    this.io.to(roomId).emit('room_state_updated', room);
                }
                this.io.emit('rooms_updated', this.roomService.getRooms());
            });

            // Player Ready
            socket.on('player_ready', (data, callback) => {
                try {
                    const { roomId, isReady, dream, token } = data;
                    const room = this.roomService.setPlayerReady(roomId, socket.id, isReady, dream, token);
                    this.io.to(roomId).emit('room_state_updated', room);

                    // Check if all ready -> Enable Start Button (or auto start?)
                    // For now, just state update, client handles "Start" button visibility for creator
                    callback({ success: true });
                } catch (e: any) {
                    callback({ success: false, error: e.message });
                }
            });

            // Start Game
            socket.on('start_game', (data) => {
                const { roomId } = data;
                // Verify is creator
                const room = this.roomService.getRoom(roomId);
                if (room && room.players[0].id === socket.id) { // Simply check first player
                    if (this.roomService.checkAllReady(roomId)) {
                        this.roomService.startGame(roomId);

                        // Init Engine
                        const engine = new GameEngine(roomId, room.players);
                        this.games.set(roomId, engine);

                        this.io.to(roomId).emit('game_started', { roomId, state: engine.getState() });
                        // Broadcast lobby update (room no longer waiting)
                        this.io.emit('rooms_updated', this.roomService.getRooms());
                    }
                }
            });

            // Game Actions
            socket.on('roll_dice', ({ roomId }) => {
                const game = this.games.get(roomId);
                if (game) {
                    const roll = game.rollDice();
                    this.io.to(roomId).emit('dice_rolled', { roll, state: game.getState() });
                }
            });

            socket.on('take_loan', ({ roomId, amount }) => {
                const game = this.games.get(roomId);
                if (game) {
                    try {
                        game.takeLoan(amount);
                        this.io.to(roomId).emit('state_updated', { state: game.getState() });
                    } catch (e: any) {
                        socket.emit('error', e.message);
                    }
                }
            });

            socket.on('end_turn', ({ roomId }) => {
                const game = this.games.get(roomId);
                if (game) {
                    game.endTurn();
                    this.io.to(roomId).emit('turn_ended', { state: game.getState() });
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
