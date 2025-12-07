import React, { useState, useEffect } from 'react';
import { Transaction } from './types';
import { getTransactions, saveTransactions } from './services/storage';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import AiInsights from './components/AiInsights';
import { LayoutGrid, List } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');

  // Load initial data
  useEffect(() => {
    const loaded = getTransactions();
    setTransactions(loaded);
  }, []);

  // Save on change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-8">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">RealtyTrack</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
               onClick={() => setView('dashboard')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${view === 'dashboard' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <LayoutGrid className="w-4 h-4 mr-2" /> Overview
             </button>
             <button 
               onClick={() => setView('history')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center ${view === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <List className="w-4 h-4 mr-2" /> History
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {view === 'dashboard' && (
          <div className="animate-fade-in">
             <Dashboard transactions={transactions} />
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 space-y-6">
                  <TransactionForm onAddTransaction={addTransaction} />
                  <TransactionList transactions={transactions} onDelete={deleteTransaction} />
               </div>
               <div className="lg:col-span-1">
                 <AiInsights transactions={transactions} />
                 
                 {/* Mini Project Summary List */}
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                   <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Project Status</h4>
                   <div className="space-y-3">
                     {['Galaxy', 'Tatva Developer', 'Kalpchandra Serenity', 'Bouganvilla'].map(project => {
                        // Calculate quick stats for project
                        const projTx = transactions.filter(t => t.category === project);
                        const net = projTx.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
                        return (
                          <div key={project} className="flex justify-between items-center text-sm">
                            <span className="text-slate-700">{project}</span>
                            <span className={`font-mono font-medium ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {net >= 0 ? '+' : ''}{net.toLocaleString()}
                            </span>
                          </div>
                        )
                     })}
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {view === 'history' && (
           <div className="animate-fade-in h-[calc(100vh-140px)]">
             <TransactionList transactions={transactions} onDelete={deleteTransaction} />
           </div>
        )}
      </main>

    </div>
  );
}

export default App;
