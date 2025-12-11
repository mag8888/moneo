import { v4 as uuidv4 } from 'uuid';
import { RoomModel, IRoom } from '../models/room.model';

export class RoomService {

    constructor() { }

    async createRoom(creatorId: string, userId: string, playerName: string, name: string, maxPlayers: number = 6, timer: number = 120, password?: string): Promise<any> {
        const room = await RoomModel.create({
            name,
            creatorId, // This is the socket ID of the creator initially
            maxPlayers,
            timer,
            password,
            players: [{
                id: creatorId,
                userId: userId, // Persistent ID
                name: playerName,
                isReady: false
            }],
            status: 'waiting',
            createdAt: Date.now()
        });
        return this.sanitizeRoom(room);
    }

    async joinRoom(roomId: string, playerId: string, userId: string, playerName: string, password?: string): Promise<any> {
        const room = await RoomModel.findById(roomId);
        if (!room) throw new Error("Room not found");
        // Allow rejoin if game started provided user is in list
        if (room.status !== 'waiting' && !room.players.some(p => p.userId === userId)) throw new Error("Game already started");

        // If not already in room and full
        if (!room.players.some(p => p.userId === userId) && room.players.length >= room.maxPlayers) {
            throw new Error("Room is full");
        }

        if (room.password && room.password !== password) throw new Error("Invalid password");

        // Idempotency: Identity by userId
        const existingPlayerIndex = room.players.findIndex(p => p.userId === userId);

        if (existingPlayerIndex !== -1) {
            const oldSocketId = room.players[existingPlayerIndex].id;

            // Player exists, update socket ID and name
            room.players[existingPlayerIndex].id = playerId; // Update socket ID
            room.players[existingPlayerIndex].name = playerName;

            // Fix Host permissions: If this player was the host (creatorId matched old socket ID), update creatorId
            if (room.creatorId === oldSocketId) {
                room.creatorId = playerId;
            }
        } else {
            room.players.push({
                id: playerId,
                userId: userId,
                name: playerName,
                isReady: false
            });
        }

        await room.save();
        return this.sanitizeRoom(room);
    }

    async leaveRoom(roomId: string, playerId: string): Promise<void> {
        // We use $pull to remove the player
        await RoomModel.findByIdAndUpdate(roomId, {
            $pull: { players: { id: playerId } }
        });

        // Check if room is empty, if so, maybe delete? 
        // For now let's keep it simple. If we want to auto-delete empty rooms:
        const room = await RoomModel.findById(roomId);
        if (room) {
            if (room.players.length === 0) {
                await RoomModel.findByIdAndDelete(roomId);
            } else if (room.creatorId === playerId) {
                // If creator leaves, promote next player
                room.creatorId = room.players[0].id;
                await room.save();
            }
        }
    }

    async kickPlayer(roomId: string, requesterId: string, playerIdToKick: string): Promise<void> {
        const room = await RoomModel.findById(roomId);
        if (!room) throw new Error("Room not found");

        if (room.creatorId !== requesterId) {
            throw new Error("Only the host can kick players");
        }

        if (requesterId === playerIdToKick) {
            throw new Error("Host cannot kick themselves");
        }

        await this.leaveRoom(roomId, playerIdToKick);
    }

    async getRooms(): Promise<any[]> {
        const rooms = await RoomModel.find({ status: 'waiting' }).sort({ createdAt: -1 });
        return rooms.map(r => this.sanitizeRoom(r));
    }

    async getRoom(roomId: string): Promise<any> {
        const room = await RoomModel.findById(roomId);
        return room ? this.sanitizeRoom(room) : null;
    }

    async setPlayerReady(roomId: string, playerId: string, userId: string, isReady: boolean, dream?: string, token?: string): Promise<any> {
        const room = await RoomModel.findById(roomId);
        if (!room) throw new Error("Room not found");

        let player = room.players.find(p => p.id === playerId);

        // JIT Reconnection fallback
        if (!player && userId) {
            player = room.players.find(p => p.userId === userId);
            if (player) {
                // Update the stale socket ID to the new one
                player.id = playerId;

                // Also Check and fix host if needed (though unlikely to be needed here if joinRoom handles it, but safety first)
                if (room.creatorId && room.players[0].userId === userId) {
                    // This heuristic (first player) is one way, or we could check if we need to ... 
                    // Actually, rely on joinRoom for host fix. Here just fix the player reference.
                    // But wait, if creatorId is stale, we might want to update it if we are sure?
                    // Let's keep it simple.
                }
            }
        }

        if (!player) throw new Error("Player not in room");

        // Validate Dream (Mandatory per requirements)
        if (isReady && !dream) {
            throw new Error("Выберите мечту перед тем как нажать Готов");
        }

        if (token) {
            // Check based on Token uniqueness. 
            // Exclude SELF using userId if possible, or socketId.
            // player.id is now up to date.
            const tokenTaken = room.players.some(p => p.token === token && p.id !== player!.id);
            if (tokenTaken) {
                throw new Error("Эта фишка уже занята другим игроком");
            }
            player.token = token;
        }

        player.isReady = isReady;
        if (dream) player.dream = dream;

        await room.save();
        return this.sanitizeRoom(room);
    }

    async checkAllReady(roomId: string): Promise<boolean> {
        const room = await RoomModel.findById(roomId);
        if (!room || room.players.length === 0) return false;
        return room.players.every(p => p.isReady);
    }

    async startGame(roomId: string): Promise<void> {
        await RoomModel.findByIdAndUpdate(roomId, { status: 'playing' });
    }

    // Helper to format room for frontend (convert _id to id)
    private sanitizeRoom(room: any): any {
        const obj = room.toObject ? room.toObject() : room;
        obj.id = obj._id.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
    }
}
