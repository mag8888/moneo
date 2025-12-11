export interface Card {
    id: string;
    type: 'MARKET' | 'EXPENSE' | 'DEAL_SMALL' | 'DEAL_BIG';
    title: string;
    description: string;
    cost?: number; // For Assets
    cashflow?: number; // For Assets
    price?: number; // For Market (Selling price)
    downPayment?: number;
    liability?: number; // Mortgage
    roi?: number;
    symbol?: string; // For stocks
}

// The original MARKET_CARDS constant is removed as the marketDeck is now defined directly in CardManager.

export const EXPENSE_CARDS: Card[] = [
    { id: '1', type: 'EXPENSE', title: 'New Phone', description: 'Bought latest model', cost: 800 }, // Changed id to string
    { id: '2', type: 'EXPENSE', title: 'Car Repair', description: 'Engine failure', cost: 1200 }, // Changed id to string
];

export class CardManager {
    private marketDeck: Card[] = [
        {
            id: 'm1',
            type: 'MARKET',
            title: 'House for Sale 3Br/2Ba',
            description: 'Good rental property. Positive cashflow.',
            cost: 35000,
            downPayment: 5000,
            cashflow: 200,
            roi: 48
        },
        {
            id: 'm2',
            type: 'MARKET',
            title: 'Condo 2Br/1Ba',
            description: 'Beginner investment.',
            cost: 20000,
            downPayment: 2000,
            cashflow: 100,
            roi: 60
        },
        {
            id: 'm3',
            type: 'MARKET',
            title: 'Stock: MYT4U',
            description: 'Electronics company. Trading at low.',
            cost: 10, // Price per share
            symbol: 'MYT4U',
            roi: 0 // Stocks don't give cashflow usually in Rat Race unless dividend, mostly for capital gain
        },
        {
            id: 'm4',
            type: 'MARKET',
            title: 'Limited Partnership',
            description: 'Small business investment.',
            cost: 5000,
            downPayment: 5000,
            cashflow: 150
        }
    ];
    expenseDeck: Card[] = [...EXPENSE_CARDS];

    drawMarket(): Card {
        if (this.marketDeck.length === 0) {
            // Re-initialize marketDeck with the original set if empty
            this.marketDeck = [
                {
                    id: 'm1',
                    type: 'MARKET',
                    title: 'House for Sale 3Br/2Ba',
                    description: 'Good rental property. Positive cashflow.',
                    cost: 35000,
                    downPayment: 5000,
                    cashflow: 200,
                    roi: 48
                },
                {
                    id: 'm2',
                    type: 'MARKET',
                    title: 'Condo 2Br/1Ba',
                    description: 'Beginner investment.',
                    cost: 20000,
                    downPayment: 2000,
                    cashflow: 100,
                    roi: 60
                },
                {
                    id: 'm3',
                    type: 'MARKET',
                    title: 'Stock: MYT4U',
                    description: 'Electronics company. Trading at low.',
                    cost: 10, // Price per share
                    symbol: 'MYT4U',
                    roi: 0 // Stocks don't give cashflow usually in Rat Race unless dividend, mostly for capital gain
                },
                {
                    id: 'm4',
                    type: 'MARKET',
                    title: 'Limited Partnership',
                    description: 'Small business investment.',
                    cost: 5000,
                    downPayment: 5000,
                    cashflow: 150
                }
            ];
        }
        const card = this.marketDeck.shift();
        return card!;
    }

    drawExpense(): Card {
        if (this.expenseDeck.length === 0) this.expenseDeck = [...EXPENSE_CARDS];
        const card = this.expenseDeck.shift();
        return card!;
    }
}
