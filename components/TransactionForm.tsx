import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Transaction, TransactionType } from '../types';
import { suggestCategory } from '../services/geminiService';
import { Plus, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  onAddTransaction: (t: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

const TransactionForm: React.FC<Props> = ({ onAddTransaction }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [subcategory, setSubcategory] = useState(CATEGORIES[0].subcategories[0]);
  const [notes, setNotes] = useState('');
  
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Update subcategories when category changes
  useEffect(() => {
    const cat = CATEGORIES.find(c => c.name === category);
    if (cat) {
      setSubcategory(cat.subcategories[0]);
      if (cat.defaultType) setType(cat.defaultType);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    onAddTransaction({
      date,
      amount: parseFloat(amount),
      type,
      category,
      subcategory,
      notes
    });

    // Reset form partially (keep date, maybe category)
    setAmount('');
    setNotes('');
  };

  const handleSmartSuggest = async () => {
    if (!notes.trim()) return;
    setIsSuggesting(true);
    const suggestion = await suggestCategory(notes);
    setIsSuggesting(false);

    if (suggestion) {
      // Validate if category exists in our list to avoid bad state
      const catExists = CATEGORIES.find(c => c.name === suggestion.category);
      if (catExists) {
        setCategory(suggestion.category);
        setType(suggestion.type);
        
        // Check if subcategory exists, if not default to first
        if (catExists.subcategories.includes(suggestion.subcategory)) {
          setSubcategory(suggestion.subcategory);
        } else {
          setSubcategory(catExists.subcategories[0]);
        }
      }
    }
  };

  const formatDisplayAmount = (val: string) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
  };

  const currentCategoryDef = CATEGORIES.find(c => c.name === category);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Plus className="w-5 h-5 mr-2 text-indigo-600" /> 
        New Transaction
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Amount & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="text"
                inputMode="decimal"
                value={isAmountFocused ? amount : formatDisplayAmount(amount)}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  if ((val.match(/\./g) || []).length > 1) return;
                  setAmount(val);
                }}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-semibold"
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
             <div className="flex bg-slate-100 p-1 rounded-lg">
               <button
                 type="button"
                 onClick={() => setType('INCOME')}
                 className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${type === 'INCOME' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Income
               </button>
               <button
                 type="button"
                 onClick={() => setType('EXPENSE')}
                 className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Expense
               </button>
             </div>
          </div>
        </div>

        {/* Row 2: Note & AI Button */}
        <div>
           <label className="block text-sm font-medium text-slate-600 mb-1">Description / Notes</label>
           <div className="flex gap-2">
             <input 
                type="text" 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={() => { if(notes && !amount) handleSmartSuggest() }} // Auto trigger on blur if amount empty (lazy way to detect start)
                placeholder="e.g., Cement for Galaxy Project"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                type="button"
                onClick={handleSmartSuggest}
                disabled={isSuggesting || !notes}
                className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors tooltip-trigger relative group"
                title="Auto-categorize with AI"
              >
                {isSuggesting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
              </button>
           </div>
        </div>

        {/* Row 3: Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
           </div>
           
           <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Subcategory</label>
              <select 
                value={subcategory} 
                onChange={e => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {currentCategoryDef?.subcategories.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
           </div>
        </div>

        {/* Row 4: Date & Submit */}
        <div className="grid grid-cols-2 gap-4 items-end">
           <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
           </div>
           
           <button 
             type="submit"
             className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg shadow-md transition-all active:scale-95"
           >
             Save Entry
           </button>
        </div>

      </form>
    </div>
  );
};

export default TransactionForm;