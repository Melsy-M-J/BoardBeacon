
import React from 'react';

export interface BadgeProps {
    wins: number;
    title: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

const TIER_STYLES = {
    bronze: {
        border: 'border-amber-700',
        text: 'text-amber-500',
        bg: 'bg-amber-900/20',
        icon: 'text-amber-600'
    },
    silver: {
        border: 'border-slate-400',
        text: 'text-slate-300',
        bg: 'bg-slate-800/50',
        icon: 'text-slate-400'
    },
    gold: {
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        bg: 'bg-yellow-900/20',
        icon: 'text-yellow-500'
    },
    platinum: {
        border: 'border-cyan-400',
        text: 'text-cyan-300',
        bg: 'bg-cyan-900/20',
        icon: 'text-cyan-400'
    },
    diamond: {
        border: 'border-purple-500',
        text: 'text-purple-300',
        bg: 'bg-purple-900/20',
        icon: 'text-purple-400'
    }
};

const Badge: React.FC<BadgeProps> = ({ wins, title, tier }) => {
    const styles = TIER_STYLES[tier];

    return (
        <div className={`group relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${styles.border} ${styles.bg} shadow-md cursor-help transition-transform hover:scale-110`}>
             <div className="flex flex-col items-center leading-none">
                 <span className={`font-bold text-sm sm:text-base ${styles.text}`}>{wins}</span>
             </div>
             
             {/* Tooltip */}
             <div className="absolute bottom-full mb-2 hidden group-hover:block w-max px-3 py-1.5 bg-brand-dark border border-brand-secondary text-brand-light text-xs rounded z-50 shadow-xl animate-fade-in pointer-events-none">
                <p className="font-bold text-brand-accent">{title}</p>
                <p className="text-[10px] text-gray-400">{wins} Wins Badge</p>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-brand-dark border-r border-b border-brand-secondary rotate-45"></div>
             </div>
        </div>
    );
};

export default Badge;
