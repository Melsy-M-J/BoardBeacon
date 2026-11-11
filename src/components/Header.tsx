import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { GameAudioContext } from '../contexts/AudioContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Volume2, VolumeX, User, Trophy, LayoutGrid, Flame, Palette } from 'lucide-react';

interface HeaderProps {
  currentView: 'lobby' | 'challenges' | 'profile' | 'leaderboard';
  setView: (view: 'lobby' | 'challenges' | 'profile' | 'leaderboard') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { user } = useContext(AuthContext);
  const { soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { currentTheme } = useContext(ThemeContext);

  return (
    <header
      style={{
        backgroundColor: 'var(--theme-surface-card, #0f172a)',
        borderColor: 'var(--theme-border-hairline, #1e293b)',
        color: 'var(--theme-text-primary, #f8fafc)',
      }}
      className="w-full max-w-5xl flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-6 backdrop-blur-md rounded-2xl border shadow-xl fixed top-3 left-1/2 -translate-x-1/2 z-40 transition-colors duration-300"
    >
      {/* Brand Logo */}
      <button
        onClick={() => setView('lobby')}
        className="flex items-center gap-2.5 sm:gap-3 text-left group transition-transform active:scale-95 flex-shrink-0"
      >
        <div
          style={{
            background: 'linear-gradient(135deg, var(--theme-accent-primary, #06b6d4), var(--theme-accent-hover, #22d3ee))',
            color: '#020617',
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl shadow-lg transition-shadow"
        >
          ♟
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm sm:text-lg tracking-tight">
              BoardBeacon
            </span>
          </div>
          <span className="text-[10px] opacity-70 hidden sm:block -mt-0.5">
            Classic Games & Daily Puzzles
          </span>
        </div>
      </button>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setView('lobby')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            currentView === 'lobby'
              ? 'bg-[var(--theme-accent-glow)] text-[var(--theme-accent-hover)] border border-[var(--theme-accent-primary)]'
              : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lobby</span>
        </button>

        {/* Daily Challenges Nav item */}
        <button
          onClick={() => setView('challenges')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
            currentView === 'challenges'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
          <span>Daily</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 hidden md:inline-block">
            {user.dailyStreak || 1}d
          </span>
        </button>

        <button
          onClick={() => setView('leaderboard')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            currentView === 'leaderboard'
              ? 'bg-[var(--theme-accent-glow)] text-[var(--theme-accent-hover)] border border-[var(--theme-accent-primary)]'
              : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ranks</span>
        </button>

        {/* Profile & Skin Button */}
        <button
          onClick={() => setView('profile')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            currentView === 'profile'
              ? 'bg-[var(--theme-accent-glow)] text-[var(--theme-accent-hover)] border border-[var(--theme-accent-primary)]'
              : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
          }`}
          title={`Active Skin: ${currentTheme.name} (Change in Profile)`}
        >
          <User className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{user?.username || 'Profile'}</span>
          <span className="hidden xl:inline text-[10px] opacity-70 font-mono px-1.5 py-0.5 rounded bg-black/20">
            {currentTheme.name.split(' ')[0]}
          </span>
        </button>

        <div className="w-px h-5 bg-slate-800/60 mx-0.5 sm:mx-1" />

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 sm:p-2 rounded-xl transition-colors hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[var(--theme-accent-hover)]" /> : <VolumeX className="w-4 h-4 opacity-50" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
