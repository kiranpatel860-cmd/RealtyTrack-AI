export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  type: TransactionType;
  category: string;
  subcategory: string;
  notes: string;
  timestamp: number;
}

export interface CategoryDefinition {
  name: string;
  subcategories: string[];
  defaultType?: TransactionType;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export interface AiInsight {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  flags: string[];
}
