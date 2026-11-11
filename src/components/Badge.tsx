import React from 'react';
import { Badge as BadgeType } from '../types/challenges';
import { Lock, Sparkles } from 'lucide-react';

interface BadgeProps {
  badge: BadgeType;
  isUnlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ badge, isUnlocked = true, size = 'md' }) => {
  const rarityColors = {
    Common: {
      border: 'border-slate-700',
      bg: 'bg-slate-900/80',
      tag: 'bg-slate-800 text-slate-300',
      glow: '',
    },
    Rare: {
      border: 'border-cyan-500/40',
      bg: 'bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-900',
      tag: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      glow: 'shadow-md shadow-cyan-500/10',
    },
    Epic: {
      border: 'border-purple-500/40',
      bg: 'bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900',
      tag: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      glow: 'shadow-lg shadow-purple-500/15',
    },
    Legendary: {
      border: 'border-amber-500/50',
      bg: 'bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900',
      tag: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold',
      glow: 'shadow-xl shadow-amber-500/20 ring-1 ring-amber-500/30',
    },
  };

  const style = rarityColors[badge.rarity] || rarityColors.Common;

  if (size === 'sm') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${
          isUnlocked ? `${style.bg} ${style.border} text-slate-200` : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
        }`}
        title={`${badge.name}: ${badge.description}`}
      >
        <span className="text-sm">{badge.icon}</span>
        <span className="font-semibold truncate max-w-[100px]">{badge.name}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 ${
        isUnlocked
          ? `${style.bg} ${style.border} ${style.glow} hover:-translate-y-0.5`
          : 'bg-slate-950/50 border-slate-800/80 opacity-50 grayscale'
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
        {isUnlocked ? badge.icon : <Lock className="w-4 h-4 text-slate-500" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-white text-xs sm:text-sm truncate">
            {badge.name}
          </h4>
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${style.tag}`}>
            {badge.rarity}
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
          {badge.description}
        </p>

        {isUnlocked && badge.unlockedAt && (
          <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default Badge;
