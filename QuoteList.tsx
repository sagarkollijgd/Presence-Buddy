import React, { useState, useRef } from 'react';
import { Quote } from '../types';
import { Button } from './Button';
import { generateSimilarQuotes } from '../services/geminiService';

interface QuoteListProps {
  quotes: Quote[];
  onUpdateQuotes: (newQuotes: Quote[]) => void;
  onBack: () => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({ quotes, onUpdateQuotes, onBack }) => {
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newQuoteText.trim()) return;
    const newQuote: Quote = {
      id: crypto.randomUUID(),
      text: newQuoteText,
      author: newQuoteAuthor || 'Anonymous'
    };
    onUpdateQuotes([newQuote, ...quotes]);
    setNewQuoteText('');
    setNewQuoteAuthor('');
  };

  const handleDelete = (id: string) => {
    onUpdateQuotes(quotes.filter(q => q.id !== id));
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateSimilarQuotes(quotes);
      if (generated.length > 0) {
        onUpdateQuotes([...generated, ...quotes]);
      }
    } catch (e) {
      console.error(e);
      alert("Could not generate quotes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        parseCSV(text);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/);
      const newQuotes: Quote[] = [];

      lines.forEach(line => {
        if (!line.trim()) return;
        
        // Simple CSV parse: assumes comma separation. 
        // Handles basic quoted fields e.g., "Quote text", "Author"
        // This is a basic implementation.
        let parts: string[] = [];
        if (line.includes('"')) {
           // Regex to match CSV fields respecting quotes
           const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
           if (matches) {
             parts = matches.map(m => m.replace(/^,/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim());
           }
        } else {
           parts = line.split(',').map(s => s.trim());
        }

        // We expect at least the first column to be text.
        // If header row "Quote,Author" is present, we skip if it looks like a header
        if (parts.length > 0 && parts[0].toLowerCase() !== 'quote') {
          const text = parts[0];
          const author = parts[1] || 'Unknown';
          
          if (text) {
             newQuotes.push({
               id: crypto.randomUUID(),
               text,
               author
             });
          }
        }
      });

      if (newQuotes.length > 0) {
        onUpdateQuotes([...newQuotes, ...quotes]);
        alert(`Successfully imported ${newQuotes.length} quotes!`);
      } else {
        alert("No valid quotes found in file.");
      }
    } catch (error) {
      console.error("CSV Parse Error", error);
      alert("Error parsing CSV file. Please check the format.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-300 pt-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl serif-font text-stone-100">My Collection</h2>
        <Button variant="ghost" onClick={onBack}>Close</Button>
      </div>

      {/* Add New Manually */}
      <div className="bg-stone-900/50 p-6 rounded-2xl shadow-lg border border-stone-800 mb-8 backdrop-blur-sm">
        <h3 className="text-lg font-medium mb-4 text-stone-300">Add a Quote</h3>
        <div className="space-y-4">
          <textarea
            value={newQuoteText}
            onChange={(e) => setNewQuoteText(e.target.value)}
            placeholder="Enter a quote that brings you peace..."
            className="w-full p-4 rounded-xl bg-stone-950 border border-stone-800 focus:ring-2 focus:ring-stone-600 focus:border-transparent outline-none transition-all resize-none h-24 text-stone-200 placeholder-stone-600"
          />
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newQuoteAuthor}
              onChange={(e) => setNewQuoteAuthor(e.target.value)}
              placeholder="Author (optional)"
              className="flex-1 p-3 rounded-xl bg-stone-950 border border-stone-800 focus:ring-2 focus:ring-stone-600 focus:border-transparent outline-none text-stone-200 placeholder-stone-600"
            />
            <Button onClick={handleAdd} disabled={!newQuoteText.trim()}>
              Add Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Upload Instructions */}
      <div className="bg-stone-900/30 p-4 rounded-xl border border-stone-800 mb-8 text-sm text-stone-400">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="font-bold text-stone-300 mb-1">Bulk Upload via Google Sheets</p>
                <ol className="list-decimal list-inside space-y-1 ml-1 marker:text-stone-600">
                    <li>Open Google Sheets.</li>
                    <li>Column A: <strong>Quote Text</strong>. Column B: <strong>Author</strong>.</li>
                    <li>Do not use a header row.</li>
                    <li>File &gt; Download &gt; <strong>Comma Separated Values (.csv)</strong>.</li>
                </ol>
            </div>
            <div>
                <input 
                    type="file" 
                    accept=".csv" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-xs">
                    Upload CSV
                </Button>
            </div>
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-stone-500 text-sm">{quotes.length} quotes in library</span>
        <Button variant="secondary" onClick={handleGenerateMore} isLoading={isGenerating}>
          ✨ AI Inspire Me
        </Button>
      </div>

      {/* Quotes List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {quotes.map((quote) => (
          <div key={quote.id} className="group flex items-start justify-between bg-stone-900/50 p-5 rounded-xl border border-stone-800 hover:border-stone-600 transition-colors">
            <div className="pr-4">
              <p className="text-stone-200 text-lg mb-2 font-light">"{quote.text}"</p>
              <p className="text-stone-500 text-sm italic">— {quote.author}</p>
            </div>
            <button 
              onClick={() => handleDelete(quote.id)}
              className="text-stone-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all"
              title="Remove quote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="text-center py-12 text-stone-600 bg-stone-900/20 rounded-xl border-dashed border-2 border-stone-800">
            No quotes yet. Add one, upload a CSV, or ask AI for inspiration.
          </div>
        )}
      </div>
    </div>
  );
};