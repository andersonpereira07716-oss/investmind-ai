import React from 'react';
import InvestMindEliteUI from './components/InvestMindEliteUI';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 text-slate-100">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-cyan-400 tracking-wider">InvestMind AI</h1>
        <p className="text-xs text-slate-400">Enterprise Wealth Management Suite • Nota 10</p>
      </header>
      <main>
        <InvestMindEliteUI />
      </main>
    </div>
  );
}
