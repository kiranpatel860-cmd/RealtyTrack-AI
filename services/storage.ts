import { Transaction } from '../types';

const STORAGE_KEY = 'realty_track_data_v1';

export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load transactions", e);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error("Failed to save transactions", e);
  }
};

export const exportToCSV = (transactions: Transaction[]) => {
  const headers = ['Date', 'Type', 'Category', 'Subcategory', 'Amount', 'Notes'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => {
      const row = [
        `"${t.date}"`,
        t.type,
        `"${t.category}"`,
        `"${t.subcategory}"`,
        t.amount,
        `"${t.notes.replace(/"/g, '""')}"`
      ];
      return row.join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `realty_track_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
