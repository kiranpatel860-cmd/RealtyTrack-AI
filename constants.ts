import { CategoryDefinition } from './types';

export const REAL_ESTATE_SUBCATEGORIES = [
  'Capital Investment',
  'Loans Given',
  'Loans Received',
  'Part Profits',
  'Investor Funds',
  'Construction Material',
  'Labor Cost',
  'Other'
];

export const CATEGORIES: CategoryDefinition[] = [
  // Real Estate Projects
  { name: 'Galaxy', subcategories: REAL_ESTATE_SUBCATEGORIES },
  { name: 'Tatva Developer', subcategories: REAL_ESTATE_SUBCATEGORIES },
  { name: 'Kalpchandra Serenity', subcategories: REAL_ESTATE_SUBCATEGORIES },
  { name: 'Bouganvilla', subcategories: REAL_ESTATE_SUBCATEGORIES },
  { name: 'Varaj Vihar', subcategories: REAL_ESTATE_SUBCATEGORIES },
  
  // Other Categories
  { 
    name: 'Investments', 
    subcategories: ['SIP', 'Gold SIP', 'Stocks', 'Fixed Deposit', 'Other'] 
  },
  { 
    name: 'Insurance', 
    subcategories: ['Mediclaim', 'Teams Plan', 'LIC Policy', 'Vehicle Insurance', 'Other'] 
  },
  { 
    name: 'Loans', 
    subcategories: ['Home Loan', 'Personal Loan', 'Business Loan', 'Car Loan'] 
  },
  { 
    name: 'Friends & Family', 
    subcategories: ['Loans Given', 'Loans Taken', 'Gift', 'Help'] 
  },
  { 
    name: 'Regular Expenses', 
    subcategories: [
      'Home Expenses', 
      'Electrical Expenses', 
      'Property Tax', 
      'Vehicle Expenses', 
      'Traveling Expenses', 
      'School Fees', 
      'Family Welfare',
      'Food & Dining',
      'Utilities'
    ],
    defaultType: 'EXPENSE'
  }
];

export const DATE_OPTIONS: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
};
