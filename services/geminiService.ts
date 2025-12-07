import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Construct a context string of available categories for the model
const categoryContext = CATEGORIES.map(c => 
  `${c.name}: [${c.subcategories.join(', ')}]`
).join('\n');

export const suggestCategory = async (note: string): Promise<{ category: string, subcategory: string, type: 'INCOME' | 'EXPENSE' } | null> => {
  if (!note || note.trim().length < 3) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a financial assistant for a real estate developer.
        Analyze the transaction note: "${note}"
        
        Available Categories and Subcategories:
        ${categoryContext}
        
        Rules:
        1. Select the best fitting Category and Subcategory.
        2. Determine if it is likely INCOME or EXPENSE.
        3. If "Galaxy", "Tatva", "Kalpchandra", "Bouganvilla", "Varaj" are mentioned, prioritize those projects.
        4. Return JSON only.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'] }
          },
          required: ['category', 'subcategory', 'type']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("AI Category Suggestion Error:", error);
    return null;
  }
};

// --- Data Aggregation Helpers for Insights ---

const getStartDate = (range: 'month' | 'quarter' | 'year'): Date => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
  if (range === 'month') {
      d.setDate(1); // 1st of current month
  } else if (range === 'quarter') {
      d.setMonth(d.getMonth() - 3);
  } else {
      d.setFullYear(d.getFullYear() - 1);
  }
  return d;
};

const aggregateData = (transactions: Transaction[], range: 'month' | 'quarter' | 'year') => {
    const startDate = getStartDate(range);
    
    // Filter for current period analysis
    const relevantTx = transactions.filter(t => new Date(t.date) >= startDate);

    // Breakdown: Category -> Income/Expense -> Subcategories (for granular expense tracking)
    const breakdown: Record<string, { income: number, expense: number, topSubcategories: Record<string, number> }> = {};
    
    relevantTx.forEach(t => {
        if (!breakdown[t.category]) {
            breakdown[t.category] = { income: 0, expense: 0, topSubcategories: {} };
        }
        
        if (t.type === 'INCOME') {
            breakdown[t.category].income += t.amount;
        } else {
            breakdown[t.category].expense += t.amount;
            // Track subcategory expenses to identify major cost centers
            const sub = t.subcategory || 'Other';
            breakdown[t.category].topSubcategories[sub] = (breakdown[t.category].topSubcategories[sub] || 0) + t.amount;
        }
    });

    // 6 Month History for Trend/Prediction
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    
    const historyTx = transactions.filter(t => new Date(t.date) >= sixMonthsAgo);
    const trends: Record<string, { income: number, expense: number, net: number }> = {};
    
    historyTx.forEach(t => {
        // key format YYYY-MM
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        if (!trends[key]) trends[key] = { income: 0, expense: 0, net: 0 };
        
        if (t.type === 'INCOME') {
            trends[key].income += t.amount;
            trends[key].net += t.amount;
        } else {
            trends[key].expense += t.amount;
            trends[key].net -= t.amount;
        }
    });

    return {
        analysisPeriod: range,
        startDate: startDate.toISOString().split('T')[0],
        totalTransactionsInPeriod: relevantTx.length,
        breakdown,
        sixMonthTrend: trends
    };
};

export const generateInsights = async (transactions: Transaction[], timeRange: 'month' | 'quarter' | 'year' = 'month'): Promise<string> => {
  if (transactions.length === 0) return "No transactions available for analysis.";

  // Aggregate data locally to reduce token usage and provide structured info
  const data = aggregateData(transactions, timeRange);
  const dataString = JSON.stringify(data, null, 2);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a smart financial controller for a Real Estate business owner.
        
        FINANCIAL DATA (JSON):
        ${dataString}
        
        INSTRUCTIONS:
        1. **Expense & Project Analysis**: Break down expenses by Project and Category for the selected period ('${timeRange}'). Identify major cost drivers (subcategories) and profitable projects.
        2. **Cash Flow Prediction**: Using the 'sixMonthTrend' data, analyze the volatility and recent trend. Predict the likely cash flow (Net Balance) for the *upcoming month*. Explain your reasoning briefly based on the historical data.
        3. **Strategic Advice**: Provide 2 specific, actionable financial tips based on this data (e.g., cost cutting in specific subcategories, or investment adjustments).
        
        OUTPUT FORMAT:
        Markdown. Use ### Headers, **bold** for amounts, and bullet points. Be concise, professional, and insightful.
      `,
    });

    return response.text || "Could not generate insights at this time.";
  } catch (error) {
    console.error("AI Insight Generation Error:", error);
    return "Error generating insights. Please try again later.";
  }
};