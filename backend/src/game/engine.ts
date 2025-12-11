import { Room, Player } from './room.service';
import { CardManager, Card } from './card.manager';

export interface GameState {
    roomId: string;
    players: PlayerState[];
    currentPlayerIndex: number;
    currentTurnTime: number; // Seconds left
    phase: 'ROLL' | 'MOVE' | 'ACTION' | 'END';
    board: BoardSquare[];
    log: string[];
    currentCard?: Card; // Active card on screen
}

export interface PlayerState extends Player {
    cash: number;
    cashflow: number;
    income: number;
    expenses: number;
    assets: any[];
    liabilities: any[];
    position: number; // Square index (0-23 for Rat Race)
    isFastTrack: boolean;
    hasChild: boolean;
}

export interface BoardSquare {
    index: number;
    type: 'DEAL' | 'MARKET' | 'EXPENSE' | 'PAYDAY' | 'BABY' | 'CHARITY' | 'OOW' | 'DREAM';
    name: string;
}

// Mock Board Configuration (Rat Race - 24 Squares)
export const RAT_RACE_SQUARES: BoardSquare[] = Array.from({ length: 24 }, (_, i) => {
    let type: BoardSquare['type'] = 'DEAL'; // Default
    if (i % 6 === 0) type = 'PAYDAY';
    else if ([2, 10, 18].includes(i)) type = 'EXPENSE';
    else if ([7, 15, 23].includes(i)) type = 'MARKET';
    else if (i === 12) type = 'BABY';
    // Add more types...
    return { index: i, type, name: type };
});

export class GameEngine {
    state: GameState;
    cardManager: CardManager;

    constructor(roomId: string, players: Player[]) {
        this.cardManager = new CardManager();
        this.state = {
            roomId,
            players: players.map(p => this.initPlayer(p)),
            currentPlayerIndex: 0,
            currentTurnTime: 120,
            phase: 'ROLL',
            board: RAT_RACE_SQUARES,
            log: ['Game Started']
        };
    }

    initPlayer(p: Player): PlayerState {
        // TODO: Load profession stats
        return {
            ...p,
            cash: 3000, // Mock init
            cashflow: 1000,
            income: 3000,
            expenses: 2000,
            assets: [],
            liabilities: [],
            position: 0,
            isFastTrack: false,
            hasChild: false
        };
    }

    rollDice(): number {
        const roll1 = Math.floor(Math.random() * 6) + 1;
        // const roll2 = Math.floor(Math.random() * 6) + 1; // 1 or 2 dice logic? Usually 1 in Rat Race
        const total = roll1;

        this.movePlayer(total);
        return total;
    }

    movePlayer(steps: number) {
        const player = this.state.players[this.state.currentPlayerIndex];
        const oldPos = player.position;
        player.position = (player.position + steps) % this.state.board.length;

        // Passed Payday? logic
        if (player.position < oldPos && !player.isFastTrack) {
            player.cash += player.cashflow;
            this.state.log.push(`${player.name} passed Payday! +$${player.cashflow}`);
        }

        this.state.phase = 'ACTION';
        this.handleSquare(player.position);
    }

    handleSquare(pos: number) {
        const square = this.state.board[pos];
        const player = this.state.players[this.state.currentPlayerIndex];

        this.state.log.push(`${player.name} landed on ${square.type}`);

        if (square.type === 'MARKET') {
            const card = this.cardManager.drawMarket();
            this.state.currentCard = card;
            this.state.log.push(`Event: ${card.title}`);
            // Logic to apply market effect immediately or wait for user action?
            // For now, auto-apply non-choice events, wait for choice.
        } else if (square.type === 'EXPENSE') {
            const card = this.cardManager.drawExpense();
            this.state.currentCard = card;
            player.cash -= (card.cost || 0);
            this.state.log.push(`Paid $${card.cost} for ${card.title}`);
            // TODO: Check bankruptcy / Credit needed
        } else if (square.type === 'DEAL') {
            // Ask User Small/Big
            // Assume Small for now or set flag
        }
    }

    takeLoan(amount: number) {
        if (amount % 1000 !== 0) throw new Error("Loan must be multiple of 1000");
        const player = this.state.players[this.state.currentPlayerIndex];
        // TODO: Check max loan limit based on cashflow
        player.cash += amount;
        player.liabilities.push({ name: 'Bank Loan', value: amount, cost: amount * 0.1 });
        player.expenses += amount * 0.1;
        player.cashflow = player.income - player.expenses;
        this.state.log.push(`${player.name} took a loan of $${amount}`);
    }

    repayLoan(amount: number) {
        if (amount % 1000 !== 0) throw new Error("Repayment must be multiple of 1000");
        const player = this.state.players[this.state.currentPlayerIndex];
        if (player.cash < amount) throw new Error("Not enough cash");

        // Simply reduce generic loan liability relative to amount
        // For prototype, just finding a loan and reducing it or reducing general pool?
        // Simplified: Assume there is a 'Bank Loan' liability aggregation or just reduce stats
        player.cash -= amount;
        player.expenses -= amount * 0.1;
        player.cashflow = player.income - player.expenses;
        this.state.log.push(`${player.name} repaid loan of $${amount}`);
    }

    endTurn() {
        this.state.currentCard = undefined; // Clear card
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        this.state.phase = 'ROLL';
        this.state.currentTurnTime = 120;
    }

    getState(): GameState {
        return this.state;
    }
}
