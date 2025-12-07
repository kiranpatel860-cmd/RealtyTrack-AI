import React, { useMemo } from 'react';
import { Transaction, FinancialSummary } from '../types';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const Dashboard: React.FC<Props> = ({ transactions }) => {
  const summary = useMemo<FinancialSummary>(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'INCOME') {
        acc.totalIncome += curr.amount;
        acc.netBalance += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
        acc.netBalance -= curr.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, netBalance: 0 });
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Income Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="w-16 h-16 text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-emerald-600 mb-1 flex items-center">
          <ArrowUpRight className="w-4 h-4 mr-1" /> Total Income
        </p>
        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalIncome)}</h3>
      </div>

      {/* Expense Card */}
      <div className="bg-gradient-to-br from-rose-50 to-white p-5 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingDown className="w-16 h-16 text-rose-600" />
        </div>
        <p className="text-sm font-medium text-rose-600 mb-1 flex items-center">
          <ArrowDownRight className="w-4 h-4 mr-1" /> Total Expenses
        </p>
        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalExpense)}</h3>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
            <Wallet className="w-16 h-16 text-slate-600" />
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">Net Balance</p>
        <h3 className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
          {formatCurrency(summary.netBalance)}
        </h3>
      </div>

    </div>
  );
};

export default Dashboard;
