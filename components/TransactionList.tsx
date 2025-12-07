import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Search, Filter, Trash2, Download } from 'lucide-react';
import { CATEGORIES, DATE_OPTIONS } from '../constants';
import { exportToCSV } from '../services/storage';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.notes.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.amount.toString().includes(searchTerm);
      const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterCategory]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', DATE_OPTIONS);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          
          <div className="relative">
             <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <select 
               value={filterCategory}
               onChange={e => setFilterCategory(e.target.value)}
               className="pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
             >
               <option value="All">All Categories</option>
               {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
             </select>
          </div>

          <button 
            onClick={() => exportToCSV(filteredData)}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Export CSV"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[500px] p-2">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No transactions found.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredData.map(t => (
              <div key={t.id} className="group bg-white p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all flex items-center justify-between">
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.category.charAt(0)}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.category} <span className="text-slate-400 font-normal mx-1">•</span> {t.subcategory}</p>
                    <p className="text-xs text-slate-500 truncate">{t.notes || 'No notes'}</p>
                    <p className="text-xs text-slate-400 sm:hidden mt-1">{formatDate(t.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-2">
                  <div className="text-right hidden sm:block">
                     <p className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                       {t.type === 'EXPENSE' ? '-' : '+'} ₹{t.amount.toLocaleString()}
                     </p>
                     <p className="text-xs text-slate-400">{formatDate(t.date)}</p>
                  </div>
                  <div className="text-right sm:hidden">
                     <p className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                       {t.type === 'EXPENSE' ? '-' : '+'} ₹{t.amount.toLocaleString()}
                     </p>
                  </div>

                  <button 
                    onClick={() => onDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
