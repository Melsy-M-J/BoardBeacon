import React from 'react';
import { Game } from '../types';
import { Play, History, ArrowRight } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onSelect: (gameId: Game['id']) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const IconComponent = game.icon;

  return (
    <div
      onClick={() => onSelect(game.id)}
      style={{
        backgroundColor: 'var(--theme-surface-card, #0f172a)',
        borderColor: 'var(--theme-border-hairline, #1e293b)',
        color: 'var(--theme-text-primary, #f8fafc)',
      }}
      className="group relative rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between border hover:border-[var(--theme-accent-primary)] hover:shadow-lg"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            style={{
              backgroundColor: 'var(--theme-cell-light, #1e293b)',
              borderColor: 'var(--theme-border-hairline, #1e293b)',
              color: 'var(--theme-accent-hover, #22d3ee)',
            }}
            className="w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shadow-inner"
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex flex-col items-end gap-1">
            {game.isComingSoon ? (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/20 opacity-60 border border-white/10">
                Coming Soon
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--theme-accent-glow)] text-[var(--theme-accent-hover)] border border-[var(--theme-accent-primary)] flex items-center gap-1">
                <History className="w-3 h-3" />
                <span>Move Replay</span>
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold transition-colors">
          {game.name}
        </h3>
        <p className="text-xs opacity-70 mt-1 line-clamp-2 leading-relaxed">
          {game.description}
        </p>
      </div>

      <div
        style={{ borderColor: 'var(--theme-border-hairline, #1e293b)' }}
        className="mt-5 pt-3 border-t flex items-center justify-between"
      >
        <span className="text-[11px] opacity-60 font-medium">
          {game.category || 'Board Game'}
        </span>
        <div
          style={{ color: 'var(--theme-accent-hover, #06b6d4)' }}
          className="flex items-center gap-1 text-xs font-semibold group-hover:translate-x-1 transition-transform"
        >
          <span>{game.isComingSoon ? 'Preview' : 'Play & Review'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default GameCard;
