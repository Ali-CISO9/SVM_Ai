import React from 'react';
import { SystemStats } from '../types';

const StatsCard: React.FC<SystemStats> = ({ label, value, subLabel, icon, highlight }) => {
    return (
        <div className="flex flex-col gap-3 rounded-2xl p-8 border border-white/5 bg-white/[0.01] backdrop-blur-sm">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
            <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-primary/70' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined text-xs">{icon}</span>
                {subLabel}
            </div>
        </div>
    );
};

export default StatsCard;