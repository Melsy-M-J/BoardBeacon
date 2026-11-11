import React, { useState, useContext } from 'react';
import { Game, GameId } from '../types';
import GameCard from './GameCard';
import { AuthContext } from '../contexts/AuthContext';
import { getTodayChallenge } from '../services/challengeService';
import { Search, History, Sparkles, Trophy, Play, CheckCircle2, Flame, ArrowRight } from 'lucide-react';

interface GameLobbyProps {
  games: Game[];
  onSelectGame: (gameId: GameId) => void;
  onOpenChallenges?: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ games, onSelectGame, onOpenChallenges }) => {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const todayChallenge = getTodayChallenge();
  const isTodaySolved = user.completedChallengeIds?.includes(todayChallenge.id);

  const categories = ['All', 'Strategy', 'Classic', 'Puzzle'];

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' ||
      game.category === selectedCategory ||
      (selectedCategory === 'Strategy' && ['chess', 'checkers', 'connect-four'].includes(game.id)) ||
      (selectedCategory === 'Classic' && ['tic-tac-toe', 'snake-and-ladder', 'ludo'].includes(game.id)) ||
      (selectedCategory === 'Puzzle' && ['sudoku', 'memory-game', 'mahjong'].includes(game.id));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-12">
      {/* Daily Challenge Highlight Banner */}
      {onOpenChallenges && (
        <div
          onClick={onOpenChallenges}
          className="relative overflow-hidden rounded-3xl bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] p-4 sm:p-5 shadow-xl hover:border-amber-400/80 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
              <Flame className="w-6 h-6 fill-current animate-pulse text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Daily Challenge Available
                </span>
                <span className="text-[10px] font-mono text-[var(--theme-text-secondary)]">
                  {todayChallenge.dayOfWeek}
                </span>
                {isTodaySolved && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Solved
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[var(--theme-text-primary)] group-hover:text-amber-300 transition-colors">
                {todayChallenge.title}
              </h3>
              <p className="text-xs text-[var(--theme-text-secondary)] mt-0.5 line-clamp-1">
                {todayChallenge.objective}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)] opacity-70 block">Reward</span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                +{todayChallenge.points} XP {todayChallenge.badgeReward ? '· Badge' : ''}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenChallenges();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
            >
              <span>{isTodaySolved ? 'View Hub' : 'Play Puzzle'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Feature Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-60 h-60 bg-[var(--theme-accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-accent-primary)]/15 border border-[var(--theme-accent-primary)]/30 text-[var(--theme-accent-primary)] text-xs font-semibold mb-3">
            <History className="w-3.5 h-3.5 text-[var(--theme-accent-primary)]" />
            <span>Interactive Move History Recorder Included</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text-primary)] tracking-tight leading-tight">
            Play Classic Board Games & Review Every Move
          </h2>
          <p className="text-[var(--theme-text-secondary)] text-xs sm:text-sm mt-2 leading-relaxed">
            Test your wits against AI opponents with full match recording. Once a game concludes, step backwards and forwards through historical board snapshots, autoplay at custom playback speeds, and analyze key turning points.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary)] bg-[var(--theme-bg-canvas)]/70 px-2.5 py-1 rounded-lg border border-[var(--theme-border-hairline)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-accent-primary)]" />
              <span>Step-by-step scrubber</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary)] bg-[var(--theme-bg-canvas)]/70 px-2.5 py-1 rounded-lg border border-[var(--theme-border-hairline)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-accent-primary)]" />
              <span>Autoplay at 0.5x – 2x</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary)] bg-[var(--theme-bg-canvas)]/70 px-2.5 py-1 rounded-lg border border-[var(--theme-border-hairline)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-accent-primary)]" />
              <span>Click-to-jump transcripts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--theme-surface-card)] rounded-xl border border-[var(--theme-border-hairline)] w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[var(--theme-accent-primary)] text-slate-950 shadow-md font-bold'
                  : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-canvas)]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[var(--theme-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-secondary)] focus:outline-none focus:border-[var(--theme-accent-primary)]/70 transition-colors"
          />
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} onSelect={onSelectGame} />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No games found matching "{searchQuery}".
        </div>
      )}

      {/* Recent Match Activity (if any games were played) */}
      {user.recentGames && user.recentGames.length > 0 && (
        <div className="mt-4 bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--theme-text-primary)] flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--theme-accent-primary)]" />
              <span>Recently Completed Matches</span>
            </h3>
            <span className="text-xs text-[var(--theme-text-secondary)]">
              {user.recentGames.length} recorded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {user.recentGames.slice(0, 4).map((match) => (
              <div
                key={match.id}
                onClick={() => onSelectGame(match.gameId)}
                className="p-3 rounded-xl bg-[var(--theme-bg-canvas)]/70 border border-[var(--theme-border-hairline)] hover:border-[var(--theme-accent-primary)]/50 flex items-center justify-between cursor-pointer transition-all hover:bg-[var(--theme-bg-canvas)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--theme-text-primary)] text-xs">
                      {match.gameName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        match.result === 'win'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : match.result === 'loss'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-700/40 text-[var(--theme-text-secondary)]'
                      }`}
                    >
                      {match.result}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--theme-text-secondary)] mt-0.5 block">
                    {match.turns} moves · {match.durationSeconds}s duration
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--theme-accent-primary)] font-medium">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLobby;
