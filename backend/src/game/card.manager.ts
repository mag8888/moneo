// Card Types
export interface Card {
    id: string;
    type: 'MARKET' | 'EXPENSE' | 'DEAL_SMALL' | 'DEAL_BIG';
    title: string;
    description: string;
    cost?: number; // Cost to buy or Pay
    cashflow?: number; // Monthly flow
    price?: number; // Stock Price
    downPayment?: number;
    liability?: number; // Mortgage
    roi?: number;
    symbol?: string; // For stocks
    mandatory?: boolean; // For damage/events that must be accepted
}

// Expense Cards
export const EXPENSE_CARDS: Card[] = [
    { id: 'e1', type: 'EXPENSE', title: 'New Phone', description: 'Bought latest model', cost: 800 },
    { id: 'e2', type: 'EXPENSE', title: 'Car Repair', description: 'Engine failure', cost: 1200 },
    { id: 'e3', type: 'EXPENSE', title: 'Tax Audit', description: 'Pay back taxes', cost: 500 },
    { id: 'e4', type: 'EXPENSE', title: 'Shopping Spree', description: 'Clothes and shoes', cost: 1000 },
    { id: 'e5', type: 'EXPENSE', title: 'Family Vacation', description: 'Disneyland trip', cost: 2000 },
    { id: 'e6', type: 'EXPENSE', title: 'Medical Bill', description: 'Unexpected surgery', cost: 1500 },
    { id: 'e7', type: 'EXPENSE', title: 'House Repairs', description: 'Fixing the roof', cost: 800 },
    { id: 'e8', type: 'EXPENSE', title: 'New TV', description: 'OLED 4K TV', cost: 2000 },
    { id: 'e9', type: 'EXPENSE', title: 'Concert Tickets', description: 'VIP seats', cost: 300 },
    { id: 'e10', type: 'EXPENSE', title: 'Charity Ball', description: 'Donation', cost: 500 },
    { id: 'e11', type: 'EXPENSE', title: 'Boat Maintenance', description: 'If you own a boat', cost: 1000 }, // Conditional?
    { id: 'e12', type: 'EXPENSE', title: 'New Tires', description: 'For your car', cost: 400 },
];

// Generator for Small Deals
const generateSmallDeals = (): Card[] => {
    let idCounter = 1;
    const cards: Card[] = [];

    const add = (count: number, template: Partial<Card>) => {
        for (let i = 0; i < count; i++) {
            cards.push({
                id: `sd_${idCounter++}`,
                type: 'DEAL_SMALL',
                title: template.title!,
                description: template.description || '',
                cost: template.cost || 0,
                cashflow: template.cashflow || 0,
                price: template.price, // For stocks, Price is usually Cost in the context of buying
                symbol: template.symbol,
                mandatory: template.mandatory,
                ...template
            } as Card);
        }
    };

    // --- STOCKS ---
    // Tesla (TSLA)
    add(1, { title: 'Stock Split: Tesla', symbol: 'TSLA', cost: 10, description: 'Price $10. Trading Range $10-$40.' });
    add(3, { title: 'Stock: Tesla', symbol: 'TSLA', cost: 20, description: 'Price $20. Trading Range $10-$40.' });
    add(3, { title: 'Stock: Tesla', symbol: 'TSLA', cost: 30, description: 'Price $30. Trading Range $10-$40.' });
    add(1, { title: 'Stock: Tesla', symbol: 'TSLA', cost: 40, description: 'Price $40. Trading Range $10-$40.' });
    add(1, { title: 'Stock Top: Tesla', symbol: 'TSLA', cost: 50, description: 'Price $50. Trading Range $10-$40.' });

    // Microsoft (MSFT)
    add(1, { title: 'Stock Split: Microsoft', symbol: 'MSFT', cost: 10, description: 'Price $10. Range $10-$40.' });
    add(3, { title: 'Stock: Microsoft', symbol: 'MSFT', cost: 20, description: 'Price $20. Range $10-$40.' });
    add(2, { title: 'Stock: Microsoft', symbol: 'MSFT', cost: 30, description: 'Price $30. Range $10-$40.' });
    add(2, { title: 'Stock: Microsoft', symbol: 'MSFT', cost: 40, description: 'Price $40. Range $10-$40.' });
    add(1, { title: 'Stock Top: Microsoft', symbol: 'MSFT', cost: 50, description: 'Price $50. Range $10-$40.' });

    // Nvidia (NVDA)
    add(2, { title: 'Stock: Nvidia', symbol: 'NVDA', cost: 10, description: 'Price $10. Range $10-$40.' });
    add(3, { title: 'Stock: Nvidia', symbol: 'NVDA', cost: 20, description: 'Price $20. Range $10-$40.' });
    add(3, { title: 'Stock: Nvidia', symbol: 'NVDA', cost: 30, description: 'Price $30. Range $10-$40.' });
    add(2, { title: 'Stock: Nvidia', symbol: 'NVDA', cost: 40, description: 'Price $40. Range $10-$40.' });

    // Apple (AAPL)
    add(2, { title: 'Stock: Apple', symbol: 'AAPL', cost: 10, description: 'Price $10. Range $10-$40.' });
    add(5, { title: 'Stock: Apple', symbol: 'AAPL', cost: 20, description: 'Price $20. Range $10-$40.' });
    add(3, { title: 'Stock: Apple', symbol: 'AAPL', cost: 30, description: 'Price $30. Range $10-$40.' });
    add(2, { title: 'Stock: Apple', symbol: 'AAPL', cost: 40, description: 'Price $40. Range $10-$40.' });

    // Bitcoin (BTC)
    add(1, { title: 'Bitcoin Crash', symbol: 'BTC', cost: 1000, description: 'Price $1,000. Low.' });
    add(1, { title: 'Bitcoin', symbol: 'BTC', cost: 5000, description: 'Price $5,000.' });
    add(1, { title: 'Bitcoin', symbol: 'BTC', cost: 10000, description: 'Price $10,000.' });
    add(5, { title: 'Bitcoin Rally', symbol: 'BTC', cost: 20000, description: 'Price $20,000.' });
    add(1, { title: 'Bitcoin Surge', symbol: 'BTC', cost: 50000, description: 'Price $50,000.' });
    add(1, { title: 'Bitcoin Moon', symbol: 'BTC', cost: 100000, description: 'Price $100,000.' });

    // Preferred Stocks
    add(2, { title: 'Pref Stock: AT&T', symbol: 'T-PREF', cost: 5000, cashflow: 50, description: 'Preferred Stock. 12% Annual Yield.' });
    add(2, { title: 'Pref Stock: P&G', symbol: 'PG-PREF', cost: 2000, cashflow: 10, description: 'Preferred Stock. 6% Annual Yield.' });

    // --- REAL ESTATE / BUSINESS ---
    add(5, { title: 'Commuter Room', cost: 3000, cashflow: 250, description: 'Комната в пригороде. ROI 100%.' });
    add(2, { title: 'Manicure Studio', cost: 4900, cashflow: 200, description: 'Студия маникюра на 1 место.' });
    add(2, { title: 'Coffee Shop', cost: 4900, cashflow: 100, description: 'Кофейня.' });
    add(2, { title: 'Auto Repair Partner', cost: 4500, cashflow: 350, description: 'Партнёрство в автомастерской.' });
    add(2, { title: 'Raw Land', cost: 5000, cashflow: 0, description: 'Участок земли 20га. No Cashflow.' });
    add(1, { title: 'Drone for Filming', cost: 3000, cashflow: 50, description: 'Покупка дрона для съёмок.' });
    add(5, { title: 'Studio Flip', cost: 5000, cashflow: 50, description: 'Флипинг студии.' }); // Cashflow 50? Or just buy/sell? Assuming flow for now or "Deal" to sell later? "Flip" implies selling. Cost 5k, Flow 50. 

    // --- SPECIAL / EXPENSES ---
    add(1, { title: 'Loan to Friend', cost: 5000, cashflow: 0, description: 'Друг просит в займ. Рискованно.', mandatory: true });
    add(1, { title: 'Cat Shelter', cost: 5000, cashflow: 0, description: 'Пожертвование на приют кошкам.', mandatory: true });
    add(1, { title: 'Help Homeless', cost: 5000, cashflow: 0, description: 'Накормите бездомных.', mandatory: true });

    // --- DAMAGES ---
    add(2, { title: 'Roof Leak', cost: 5000, cashflow: 0, description: 'Крыша протекла. Pay $5,000 IF you own property.', mandatory: true });
    add(3, { title: 'Sewer Break', cost: 2000, cashflow: 0, description: 'Прорыв канализации. Pay $2,000.', mandatory: true });

    return cards;
};

export class CardManager {
    private smallDeals: Card[] = [];
    private smallDealsDiscard: Card[] = [];

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
    private bigDealsDiscard: Card[] = [];

    expenseDeck: Card[] = [...EXPENSE_CARDS];

    constructor() {
        this.smallDeals = this.shuffle(generateSmallDeals());
    }

    drawSmallDeal(): Card | undefined {
        if (this.smallDeals.length === 0) {
            if (this.smallDealsDiscard.length === 0) return undefined; // No cards left
            // Reshuffle
            this.smallDeals = this.shuffle([...this.smallDealsDiscard]);
            this.smallDealsDiscard = [];
        }
        return this.smallDeals.shift();
    }

    drawBigDeal(): Card | undefined {
        if (this.bigDeals.length === 0) {
            if (this.bigDealsDiscard.length === 0) return undefined;
            // Reshuffle
            this.bigDeals = this.shuffle([...this.bigDealsDiscard]);
            this.bigDealsDiscard = [];
        }
        return this.bigDeals.shift();
    }

    discard(card: Card) {
        if (card.type === 'DEAL_SMALL') {
            this.smallDealsDiscard.push(card);
        } else if (card.type === 'DEAL_BIG') {
            this.bigDealsDiscard.push(card);
        } else if (card.type === 'EXPENSE') {
            this.expenseDeck.push(card);
        }
    }

    private shuffle(array: Card[]): Card[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    drawMarket(): Card | undefined {
        // This method might be deprecated if we call drawSmallDeal/BigDeal directly based on user choice
        // But keeping it for safety
        return Math.random() > 0.5 ? this.drawSmallDeal() : this.drawBigDeal();
    }

    drawExpense(): Card {
        if (this.expenseDeck.length === 0) this.expenseDeck = [...EXPENSE_CARDS];
        const card = this.expenseDeck.shift();
        return card!;
    }
}
