export interface Card {
    id: number;
    type: 'MARKET' | 'EXPENSE' | 'DEAL_SMALL' | 'DEAL_BIG';
    title: string;
    description: string;
    cost?: number; // For Assets
    cashflow?: number; // For Assets
    price?: number; // For Market (Selling price)
    downPayment?: number;
    liability?: number; // Mortgage
}

export const MARKET_CARDS: Card[] = [
    { id: 1, type: 'MARKET', title: 'Old House', description: 'Buyer offers $25k for 2Br/1Ba', price: 25000 },
    { id: 2, type: 'MARKET', title: 'Startups Crash', description: 'Market bubbles burst.', price: 0 },
    // Simplified for prototype
];

export const EXPENSE_CARDS: Card[] = [
    { id: 1, type: 'EXPENSE', title: 'New Phone', description: 'Bought latest model', cost: 800 },
    { id: 2, type: 'EXPENSE', title: 'Car Repair', description: 'Engine failure', cost: 1200 },
];

export class CardManager {
    marketDeck: Card[] = [...MARKET_CARDS];
    expenseDeck: Card[] = [...EXPENSE_CARDS];

    drawMarket(): Card {
        if (this.marketDeck.length === 0) this.marketDeck = [...MARKET_CARDS]; // Reshuffle
        const card = this.marketDeck.shift();
        return card!;
    }

    drawExpense(): Card {
        if (this.expenseDeck.length === 0) this.expenseDeck = [...EXPENSE_CARDS];
        const card = this.expenseDeck.shift();
        return card!;
    }
}
