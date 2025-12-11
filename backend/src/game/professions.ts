export interface Profession {
    name: string;
    salary: number;
    savings: number; // Starting cash
    perChildCost: number;
    expenses: number; // Base expenses (taxes + other fixed costs)
}

export const PROFESSIONS: Profession[] = [
    {
        name: 'Airline Pilot',
        salary: 9500,
        savings: 2500,
        perChildCost: 480,
        expenses: 6900 // High taxes/lifestyle
    },
    {
        name: 'Doctor (MD)',
        salary: 13200,
        savings: 3500,
        perChildCost: 640,
        expenses: 9600
    },
    {
        name: 'Engineer',
        salary: 4900,
        savings: 2000,
        perChildCost: 250,
        expenses: 3200
    },
    {
        name: 'Teacher (K-12)',
        salary: 3300,
        savings: 1500,
        perChildCost: 180,
        expenses: 2100
    },
    {
        name: 'Nurse',
        salary: 3100,
        savings: 1700,
        perChildCost: 170,
        expenses: 1900
    },
    {
        name: 'Police Officer',
        salary: 3000,
        savings: 1600,
        perChildCost: 160,
        expenses: 1800
    },
    {
        name: 'Truck Driver',
        salary: 2500,
        savings: 1400,
        perChildCost: 140,
        expenses: 1600
    },
    {
        name: 'Janitor',
        salary: 1600,
        savings: 600,
        perChildCost: 70,
        expenses: 900
    },
    {
        name: 'Layer',
        salary: 7500,
        savings: 2200,
        perChildCost: 380,
        expenses: 5400
    },
    {
        name: 'Business Manager',
        salary: 4600,
        savings: 1800,
        perChildCost: 240,
        expenses: 2900
    },
    {
        name: 'Mechanic',
        salary: 2000,
        savings: 800,
        perChildCost: 110,
        expenses: 1200
    },
    {
        name: 'Secretary',
        salary: 2500,
        savings: 1300,
        perChildCost: 140,
        expenses: 1500
    }
];
