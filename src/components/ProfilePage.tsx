import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { ThemeId } from '../types/theme';
import { ArrowLeft, Trophy, Award, Flame, RotateCcw, Trash2, Edit2, Check, Sparkles, Star, Palette, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';
import { ALL_BADGES } from '../services/challengeService';

interface ProfilePageProps {
  onBack: () => void;
  onDeleteRequest: () => void;
}

const AVATAR_OPTIONS = ['🎲', '♟️', '👑', '🚀', '🔥', '🎯', '🦁', '⭐'];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onDeleteRequest }) => {
  const { user, updateUsername, updateAvatar, updateTheme } = useContext(AuthContext);
  const { theme, setTheme, availableThemes } = useContext(ThemeContext);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.username);

  const handleSelectTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    updateTheme(themeId);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUsername(tempName.trim());
    }
    setIsEditingName(false);
  };

  const winRate =
    user.globalStats.gamesPlayed > 0
      ? Math.round((user.globalStats.gamesWon / user.globalStats.gamesPlayed) * 100)
      : 0;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>
        <h1 className="text-lg font-bold text-white">Player Profile & Honors</h1>
      </div>

      {/* Profile Card */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface-card, #0f172a)',
          borderColor: 'var(--theme-border-hairline, #1e293b)',
        }}
        className="border rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors"
      >
        {/* Avatar Selector */}
        <div className="flex flex-col items-center gap-2">
          <div
            style={{
              backgroundColor: 'var(--theme-accent-glow, rgba(6,182,212,0.2))',
              borderColor: 'var(--theme-accent-primary, #06b6d4)',
            }}
            className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl shadow-inner"
          >
            {user.avatar || '🎲'}
          </div>
          <div className="flex gap-1.5 flex-wrap justify-center max-w-[140px]">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                onClick={() => updateAvatar(av)}
                className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-transform hover:scale-110 ${
                  user.avatar === av ? 'bg-cyan-500/40 ring-1 ring-cyan-400' : 'bg-slate-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left flex flex-col gap-3">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-slate-800 border border-cyan-500 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Recorded board game matches, daily challenge victories, and unlocked honors.
          </p>

          {/* Quick Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">XP Points</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {user.points || 0}
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Daily Streak</span>
              <span className="text-lg font-bold text-orange-400 font-mono flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-current" />
                {user.dailyStreak || 1}d
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Matches</span>
              <span className="text-lg font-bold text-white font-mono">
                {user.globalStats.gamesPlayed}
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Victories</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {user.globalStats.gamesWon}
              </span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold opacity-60 block">Win Rate</span>
              <span className="text-lg font-bold text-[var(--theme-accent-hover)] font-mono">{winRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Board Aesthetic & Game Skins Customizer */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface-card, #0f172a)',
          borderColor: 'var(--theme-border-hairline, #1e293b)',
        }}
        className="border rounded-3xl p-6 shadow-xl flex flex-col gap-4 transition-colors"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--theme-accent-hover)]" />
              <span>Board Aesthetic & Visual Skins</span>
            </h3>
            <p className="text-xs opacity-70 mt-0.5">
              Select an aesthetic skin to transform your boards, pieces, and game atmosphere.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-black/20 font-semibold opacity-90">
            5 Skins Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {availableThemes.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                style={{
                  backgroundColor: t.colors.surfaceCard,
                  borderColor: isActive ? t.colors.accentPrimary : t.colors.borderHairline,
                  color: t.colors.textPrimary,
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3.5 transition-all relative overflow-hidden group cursor-pointer ${
                  isActive
                    ? 'ring-2 shadow-lg scale-[1.01]'
                    : 'hover:scale-[1.02] hover:border-opacity-100 opacity-90 hover:opacity-100'
                }`}
              >
                {/* Active Selection Indicator */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm tracking-tight">{t.name}</span>
                  {isActive ? (
                    <span
                      style={{
                        backgroundColor: t.colors.accentPrimary,
                        color: t.category === 'light' ? '#fff' : '#020617',
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-40 group-hover:opacity-80 transition-opacity">
                      Click to apply
                    </span>
                  )}
                </div>

                {/* Live Micro Board Swatch */}
                <div
                  style={{
                    backgroundColor: t.colors.boardCasing,
                    borderColor: t.colors.boardBorder,
                  }}
                  className="p-2.5 rounded-xl border flex items-center justify-between gap-3 shadow-inner"
                >
                  {/* 3x3 Micro Checkerboard Preview */}
                  <div
                    style={{ backgroundColor: t.colors.gridBg }}
                    className="w-14 h-14 rounded-lg overflow-hidden grid grid-cols-3 grid-rows-3 border border-black/20 shrink-0"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                      const isDark = (Math.floor(i / 3) + (i % 3)) % 2 === 1;
                      const hasPiece1 = i === 4;
                      const hasPiece2 = i === 0;
                      return (
                        <div
                          key={i}
                          style={{
                            backgroundColor: isDark ? t.colors.cellDark : t.colors.cellLight,
                          }}
                          className="aspect-square w-full h-full relative flex items-center justify-center"
                        >
                          {hasPiece1 && (
                            <div
                              style={{
                                backgroundColor: t.preview.p1,
                                borderColor: t.colors.piecePlayerBorder,
                              }}
                              className="w-2.5 h-2.5 rounded-full border shadow-sm"
                            />
                          )}
                          {hasPiece2 && (
                            <div
                              style={{
                                backgroundColor: t.preview.p2,
                                borderColor: t.colors.pieceOpponentBorder,
                              }}
                              className="w-2.5 h-2.5 rounded-full border shadow-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Palette Swatch Dots */}
                  <div className="flex flex-col gap-1 text-[11px] opacity-80 flex-1">
                    <span className="truncate">{t.category === 'light' ? 'Light Mode' : 'Dark Atmosphere'}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        style={{ backgroundColor: t.colors.bgCanvas }}
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                        title="Canvas"
                      />
                      <span
                        style={{ backgroundColor: t.colors.cellDark }}
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                        title="Dark Square"
                      />
                      <span
                        style={{ backgroundColor: t.colors.cellLight }}
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                        title="Light Square"
                      />
                      <span
                        style={{ backgroundColor: t.colors.accentPrimary }}
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                        title="Accent"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] opacity-70 leading-relaxed">{t.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges Collection Showcase */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface-card, #0f172a)',
          borderColor: 'var(--theme-border-hairline, #1e293b)',
        }}
        className="border rounded-3xl p-6 shadow-xl flex flex-col gap-4 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Unlocked Badges ({user.unlockedBadges?.length || 0} / {ALL_BADGES.length})</span>
          </h3>
          <span className="text-xs opacity-60">Earned through Daily Challenges</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {ALL_BADGES.map((b) => {
            const unlockedInstance = user.unlockedBadges?.find((x) => x.id === b.id);
            return (
              <Badge
                key={b.id}
                badge={unlockedInstance || b}
                isUnlocked={Boolean(unlockedInstance)}
                size="md"
              />
            );
          })}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Recorded Match History ({user.recentGames?.length || 0})
        </h3>

        {user.recentGames && user.recentGames.length > 0 ? (
          <div className="flex flex-col gap-2">
            {user.recentGames.map((match) => (
              <div
                key={match.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      match.result === 'win'
                        ? 'bg-emerald-400'
                        : match.result === 'loss'
                        ? 'bg-rose-400'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-white block">{match.gameName}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(match.date).toLocaleDateString()} · {match.turns} total moves · {match.durationSeconds}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      match.result === 'win'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : match.result === 'loss'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-700/40 text-slate-400'
                    }`}
                  >
                    {match.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No matches recorded yet. Play any game in the lobby to log moves and review matches!
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-rose-300">Reset Player Data</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Erase all match statistics, points, badges, and recorded history.
          </p>
        </div>
        <button
          onClick={onDeleteRequest}
          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Data</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
