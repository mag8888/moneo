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
    private smallDeals: Card[] = [
        // Small Deals (Cost <= $5,000 typically, or low cost stocks)
        {
            id: 'm1', type: 'DEAL_SMALL', title: 'Condo 2Br/1Ba', description: 'Bank foreclosure. High demand area.',
            cost: 20000, downPayment: 2000, cashflow: 100, roi: 60
        },
        {
            id: 'm2', type: 'DEAL_SMALL', title: 'Start-up Stock', description: 'Tech company IPO. High risk.',
            cost: 10, symbol: 'TECH', roi: 0
        },
        {
            id: 'm3', type: 'DEAL_SMALL', title: 'Pre-Foreclosure Home', description: 'Distressed seller. 3Br/2Ba.',
            cost: 40000, downPayment: 4000, cashflow: 220, roi: 66
        },
        {
            id: 'm4', type: 'DEAL_SMALL', title: 'Gold Coins', description: 'Krugerrands per ounce.',
            cost: 1000, roi: 0
        },
        {
            id: 'm9', type: 'DEAL_SMALL', title: 'Stock: OK4U', description: 'Drug company. FDA approval pending.',
            cost: 20, symbol: 'OK4U', roi: 0
        },
        {
            id: 'm10', type: 'DEAL_SMALL', title: 'Stock: ON2U', description: 'Entertainment giant. Split rumor.',
            cost: 30, symbol: 'ON2U', roi: 0
        }
    ];

    private bigDeals: Card[] = [
        // Big Deals (Cost > $6,000, Apartments, etc)
        {
            id: 'm5', type: 'DEAL_BIG', title: '4-Plex Apartment', description: 'Steady cashflow machine.',
            cost: 120000, downPayment: 12000, cashflow: 800, roi: 80
        },
        {
            id: 'm6', type: 'DEAL_BIG', title: 'Car Wash', description: 'Automated car wash business.',
            cost: 150000, downPayment: 30000, cashflow: 2500, roi: 100
        },
        {
            id: 'm7', type: 'DEAL_BIG', title: '8-Unit Building', description: 'Fully occupied. Good management.',
            cost: 240000, downPayment: 40000, cashflow: 1800, roi: 54
        },
        {
            id: 'm8', type: 'DEAL_BIG', title: 'Shopping Mall Share', description: 'Limited partnership in a mall.',
            cost: 20000, downPayment: 20000, cashflow: 1000, roi: 60
        }
    ];
    expenseDeck: Card[] = [...EXPENSE_CARDS];

    drawSmallDeal(): Card {
        // Simple shuffle-like behavior: move to end
        const card = this.smallDeals.shift();
        if (card) this.smallDeals.push(card);
        return card!;
    }

    drawBigDeal(): Card {
        const card = this.bigDeals.shift();
        if (card) this.bigDeals.push(card);
        return card!;
    }

    drawMarket(): Card {
        {
            id: 'm4', type: 'MARKET', title: 'Gold Coins', description: 'Krugerrands per ounce.',
                cost: 1000, roi: 0
        },
        // Real Estate (Big Deals)
        {
            id: 'm5', type: 'MARKET', title: '4-Plex Apartment', description: 'Steady cashflow machine.',
                cost: 120000, downPayment: 12000, cashflow: 800, roi: 80
        },
        {
            id: 'm6', type: 'MARKET', title: 'Car Wash', description: 'Automated car wash business.',
                cost: 150000, downPayment: 30000, cashflow: 2500, roi: 100
        },
        {
            id: 'm7', type: 'MARKET', title: '8-Unit Building', description: 'Fully occupied. Good management.',
                cost: 240000, downPayment: 40000, cashflow: 1800, roi: 54
        },
        {
            id: 'm8', type: 'MARKET', title: 'Shopping Mall Share', description: 'Limited partnership in a mall.',
                cost: 20000, downPayment: 20000, cashflow: 1000, roi: 60
        },
        // More Stocks
        {
            id: 'm9', type: 'MARKET', title: 'Stock: OK4U', description: 'Drug company. FDA approval pending.',
                cost: 20, symbol: 'OK4U', roi: 0
        },
        {
            id: 'm10', type: 'MARKET', title: 'Stock: ON2U', description: 'Entertainment giant. Split rumor.',
                cost: 30, symbol: 'ON2U', roi: 0
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
