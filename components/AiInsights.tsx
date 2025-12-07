import React, { useState } from 'react';
import { Transaction } from '../types';
import { generateInsights } from '../services/geminiService';
import { BrainCircuit, RefreshCcw, Sparkles, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  transactions: Transaction[];
}

const AiInsights: React.FC<Props> = ({ transactions }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateInsights(transactions, timeRange);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg mb-6 border border-indigo-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold flex items-center text-indigo-50">
          <BrainCircuit className="w-6 h-6 mr-3 text-indigo-400" />
          AI Financial Analyst
        </h3>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 self-start sm:self-auto">
            <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-transparent text-sm text-indigo-100 font-medium px-2 py-1 outline-none [&>option]:text-slate-900 cursor-pointer w-full sm:w-auto"
            >
                <option value="month">Current Month</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
            </select>
        </div>
      </div>

      {!insight && !loading && (
        <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
            <p className="text-indigo-200 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Generate a comprehensive report including expense breakdowns by project and AI-driven cash flow predictions based on your history.
            </p>
            <button 
                onClick={handleGenerate}
                disabled={transactions.length === 0}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Sparkles className="w-4 h-4 mr-2 text-indigo-100" />
                Generate Analysis
            </button>
        </div>
      )}

      {loading && (
        <div className="py-8 space-y-4 animate-pulse max-w-2xl mx-auto">
           <div className="flex items-center justify-center text-indigo-300 text-sm mb-4">
              <RefreshCcw className="w-4 h-4 animate-spin mr-2" />
              Crunching numbers and predicting trends...
           </div>
           <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
           <div className="h-4 bg-white/5 rounded w-1/2 mx-auto"></div>
           <div className="h-32 bg-white/5 rounded-xl w-full border border-white/5"></div>
        </div>
      )}

      {insight && !loading && (
        <div className="animate-fade-in">
            <div className="prose prose-invert prose-sm max-w-none bg-black/20 p-6 rounded-xl border border-white/10 shadow-inner">
             <ReactMarkdown 
                components={{
                    h3: ({node, ...props}) => <h3 className="text-indigo-300 text-lg font-bold mt-6 mb-3 first:mt-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 text-slate-300 my-2" {...props} />,
                    p: ({node, ...props}) => <p className="leading-relaxed mb-3 text-slate-300" {...props} />
                }}
             >
                 {insight}
             </ReactMarkdown>
            </div>
            <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleGenerate}
                  className="text-xs text-indigo-300 hover:text-white flex items-center transition-colors"
                >
                    <RefreshCcw className="w-3 h-3 mr-1" /> Refresh Data
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AiInsights;