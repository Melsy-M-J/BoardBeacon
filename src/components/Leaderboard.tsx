import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ArrowLeft, Trophy, Medal, Award, Flame } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const { user } = useContext(AuthContext);

  // Leaderboard mock ranking with current user integrated
  const players = [
    { rank: 1, name: 'Grandmaster Kai', wins: 42, winRate: 88, streak: 12, avatar: '👑' },
    { rank: 2, name: 'TacticsNova', wins: 35, winRate: 79, streak: 8, avatar: '⚡' },
    { rank: 3, name: user.username, wins: user.globalStats.gamesWon, winRate: user.globalStats.gamesPlayed > 0 ? Math.round((user.globalStats.gamesWon / user.globalStats.gamesPlayed) * 100) : 0, streak: user.globalStats.bestStreak, avatar: user.avatar || '🎲', isCurrent: true },
    { rank: 4, name: 'BishopCheck', wins: 18, winRate: 64, streak: 4, avatar: '♟️' },
    { rank: 5, name: 'ConnectKing', wins: 14, winRate: 58, streak: 3, avatar: '🎯' },
  ].sort((a, b) => b.wins - a.wins).map((p, idx) => ({ ...p, rank: idx + 1 }));

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] text-[var(--theme-text-primary)] hover:border-[var(--theme-accent-primary)]/60 flex items-center gap-2 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>
        <h1 className="text-lg font-bold text-[var(--theme-text-primary)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Beacon Leaderboard</span>
        </h1>
      </div>

      <div className="bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <div className="grid grid-cols-12 text-[11px] font-bold text-[var(--theme-text-secondary)] uppercase tracking-wider px-4 pb-2 border-b border-[var(--theme-border-hairline)]">
          <span className="col-span-1">Rank</span>
          <span className="col-span-5">Player</span>
          <span className="col-span-2 text-center">Wins</span>
          <span className="col-span-2 text-center">Win Rate</span>
          <span className="col-span-2 text-right">Streak</span>
        </div>

        <div className="flex flex-col gap-2">
          {players.map((p) => {
            return (
              <div
                key={p.name}
                className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl border text-xs transition-colors ${
                  p.isCurrent
                    ? 'bg-[var(--theme-accent-primary)]/15 border-[var(--theme-accent-primary)]/40 text-[var(--theme-text-primary)] font-semibold'
                    : 'bg-[var(--theme-bg-canvas)]/70 border-[var(--theme-border-hairline)] text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-canvas)]'
                }`}
              >
                <div className="col-span-1 font-bold font-mono flex items-center gap-1.5">
                  {p.rank === 1 ? (
                    <Trophy className="w-4 h-4 text-amber-400" />
                  ) : p.rank === 2 ? (
                    <Medal className="w-4 h-4 text-slate-300" />
                  ) : p.rank === 3 ? (
                    <Award className="w-4 h-4 text-amber-600" />
                  ) : (
                    <span className="text-[var(--theme-text-secondary)] ml-1">#{p.rank}</span>
                  )}
                </div>

                <div className="col-span-5 flex items-center gap-2.5 truncate">
                  <span className="text-lg">{p.avatar}</span>
                  <span className="truncate">{p.name}</span>
                  {p.isCurrent && (
                    <span className="text-[10px] bg-[var(--theme-accent-primary)]/20 text-[var(--theme-accent-primary)] px-1.5 py-0.2 rounded font-mono font-bold">
                      YOU
                    </span>
                  )}
                </div>

                <div className="col-span-2 text-center font-mono font-bold text-[var(--theme-text-primary)]">
                  {p.wins}
                </div>

                <div className="col-span-2 text-center font-mono text-[var(--theme-accent-primary)]">
                  {p.winRate}%
                </div>

                <div className="col-span-2 text-right font-mono text-amber-400 flex items-center justify-end gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{p.streak}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
