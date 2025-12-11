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
    loanDebt: number; // Total bank loans
    position: number; // Square index (0-23 for Rat Race)
    isFastTrack: boolean;
    childrenCount: number;
    childCost: number; // Expense per child
    salary: number;
    passiveIncome: number;
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
            cash: 3000,
            assets: [],
            liabilities: [],
            loanDebt: 0,
            position: 0,
            isFastTrack: false,
            childrenCount: 0,
            childCost: 240,
            salary: 3000,
            passiveIncome: 0,
            income: 3000,
            expenses: 2000,
            cashflow: 1000
        };
    }

    private checkFastTrackCondition(player: PlayerState) {
        // "passive income covers expenses * 2 AND loans usually 0"
        // We need a way to track Loan Amount. Currently we just have repayLoan logic.
        // Let's assume player.liabilities has 'Bank Loan'.

        // For now, simplify: if passiveIncome >= expenses * 2.
        // And we need to ensure loans are paid. I'll add a 'hasLoans' check if I can track it.
        // Let's add loan tracking to Player first properly if needed, but for now logic is:

        if (player.passiveIncome >= player.expenses * 2 && player.loanDebt === 0) {
            // Check if loans exist
            // Implementation detail: need to store loan liability specificially

            // Transition
            player.isFastTrack = true;
            player.position = 0; // Reset to start of Outer Track
            player.cash += 100000; // Bonus for exiting?
            this.state.log.push(`🚀 ${player.name} ENTERED FAST TRACK!`);
        }
    }

    rollDice(): number {
        const roll1 = Math.floor(Math.random() * 6) + 1;
        // const roll2 = Math.floor(Math.random() * 6) + 1; 
        const total = roll1;

        // Phase check? 
        if (this.state.phase !== 'ROLL') return 0; // Prevent double roll

        this.movePlayer(total);
        return total;
    }

    movePlayer(steps: number) {
        const player = this.state.players[this.state.currentPlayerIndex];

        if (player.isFastTrack) {
            const trackLength = 48; // Fast Track length
            let newPos = player.position + steps;

            // Fast Track Payday Logic
            if (newPos >= trackLength) {
                newPos = newPos % trackLength;
                player.cash += player.cashflow; // Or specific Fast Track Amount?
                this.state.log.push(`${player.name} passed Fast Track Payday! +$${player.cashflow}`);
            }
            player.position = newPos;

            // Handle Squares (Mock for now, using modulo to simulate types)
            this.handleFastTrackSquare(player, newPos);

        } else {
            // Rat Race Logic
            const oldPos = player.position;
            let newPos = player.position + steps;

            if (newPos >= 24) {
                newPos = newPos % 24;
                // Payday
                player.cash += player.cashflow;
                this.state.log.push(`${player.name} passed Payday! +$${player.cashflow}`);
            }
            player.position = newPos;
            const square = this.getSquare(newPos);
            this.state.log.push(`${player.name} moved to ${square.name}`);
            this.handleSquare(player, square);
        }
        this.state.phase = 'ACTION';
    }

    private getSquare(pos: number): BoardSquare {
        return this.state.board[pos];
    }

    handleFastTrackSquare(player: PlayerState, position: number) {
        // Mock Fast Track Squares
        const type = position % 2 === 0 ? 'BUSINESS' : 'DREAM';
        this.state.log.push(`${player.name} landed on Fast Track ${type} (Pos: ${position})`);

        if (type === 'BUSINESS') {
            // Mock Business Opportunity
            const cost = 50000;
            const flow = 2000;
            // Auto-buy for now or prompt
            this.state.log.push(`Business Opp: Cost $${cost}, Flow +$${flow}`);
        }
    }

    handleSquare(player: PlayerState, square: BoardSquare) {
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
        } else if (square.type === 'BABY') {
            if (player.childrenCount >= 3) {
                this.state.log.push(`${player.name} already has max children.`);
            } else {
                // Roll for baby: 1-4 = Born, 5-6 = Not
                const roll = Math.floor(Math.random() * 6) + 1;
                if (roll <= 4) {
                    player.childrenCount++;
                    player.expenses += player.childCost;
                    player.cashflow = player.income - player.expenses;
                    // "3 разово выплачивается 5000$" - Assuming generic "Gift" based on Congratulations or Cost?
                    // Usually Baby is a Cost. But prompt says "Payout and Congrats". 
                    // Let's Give $5000 as a "Gift" for now based on "Congratulations".
                    player.cash += 5000;

                    this.state.log.push(`👶 Baby Born! (Roll: ${roll}). +$5000 Gift. Expenses +$${player.childCost}/mo`);
                } else {
                    this.state.log.push(`No Baby (Roll: ${roll}).`);
                }
            }
        }
    }

    takeLoan(playerId: string, amount: number) {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return;

        // Interest 10%
        const interest = amount * 0.1;

        player.cash += amount;
        player.loanDebt += amount;
        player.expenses += interest;
        player.cashflow = player.income - player.expenses;

        this.state.log.push(`${player.name} took loan $${amount}. Expenses +$${interest}/mo`);
    }

    repayLoan(playerId: string, amount: number) {
        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return;

        if (player.loanDebt < amount) return; // Cannot overpay
        if (player.cash < amount) return;

        const interest = amount * 0.1;

        player.cash -= amount;
        player.loanDebt -= amount;
        player.expenses -= interest;
        player.cashflow = player.income - player.expenses;

        this.state.log.push(`${player.name} repaid loan $${amount}. Expenses -$${interest}/mo`);

        // Check Fast Track after repaying loan (might free up cashflow condition)
        this.checkFastTrackCondition(player);
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
