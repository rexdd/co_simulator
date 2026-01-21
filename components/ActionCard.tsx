
import React from 'react';
import { GameCard, ResourceType } from '../types';

interface ActionCardProps {
  card: GameCard;
  onPlay: (card: GameCard) => void;
  disabled?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ card, onPlay, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => onPlay(card)}
      className={`group relative text-left p-4 rounded-xl border transition-all duration-200 
        ${disabled ? 'opacity-40 cursor-not-allowed bg-slate-900 border-white/5' : 'bg-slate-800/40 border-white/10 hover:border-cyan-500/50 hover:bg-slate-800/60 hover:-translate-y-1 active:translate-y-0 shadow-lg hover:shadow-cyan-500/10'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{card.name}</h3>
        <div className="flex gap-1">
          {Object.entries(card.cost).map(([res, val]) => (
            <span key={res} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
              -{val} {res.slice(0, 1).toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[32px]">{card.desc}</p>
      
      <div className="flex flex-wrap gap-1 mt-auto">
        {Object.entries(card.gain).map(([res, val]) => {
          const displayVal = typeof val === 'function' ? '?' : val;
          const isNegative = typeof displayVal === 'number' && displayVal < 0;
          return (
            <span key={res} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border 
              ${isNegative ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
              {res.toUpperCase()} {isNegative ? '' : '+'}{displayVal}
            </span>
          );
        })}
      </div>
      
      {!disabled && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
      )}
    </button>
  );
};

export default ActionCard;
