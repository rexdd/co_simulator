
import React from 'react';
import { ResourceType } from '../types';

interface ResourceCardProps {
  label: string;
  value: number;
  type: ResourceType;
  max?: number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ label, value, max = 100, subtitle, icon, colorClass }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isDangerous = percentage <= 20;

  return (
    <div className={`glass p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isDangerous ? 'border-red-500/50' : 'border-white/10'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{label}</span>
        <div className={`p-1.5 rounded-lg bg-slate-800/50 border border-white/5 ${colorClass}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black font-mono-jb ${isDangerous ? 'text-red-400' : 'text-white'}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {max !== 100 && <span className="text-xs text-slate-500 font-bold">/ {max}</span>}
      </div>

      {subtitle && <p className="text-[10px] text-slate-500 mt-1 truncate">{subtitle}</p>}

      <div className="h-1.5 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 rounded-full bg-gradient-to-r ${percentage < 25 ? 'from-red-500 to-red-400' : percentage < 50 ? 'from-amber-500 to-amber-400' : 'from-cyan-500 to-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isDangerous && (
        <div className="absolute top-1 right-1">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
