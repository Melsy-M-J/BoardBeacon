import React, { useState, useEffect, useContext } from 'react';
import {
  getTodayChallenge,
  getWeekChallenges,
  getTimeUntilNextChallenge,
  ALL_BADGES,
} from '../../services/challengeService';
import { DailyChallenge, Badge as BadgeType } from '../../types/challenges';
import { AuthContext } from '../../contexts/AuthContext';
import Badge from '../Badge';
import {
  Calendar,
  Flame,
  Trophy,
  Clock,
  Sparkles,
  CheckCircle2,
  Play,
  ArrowRight,
  Shield,
  Award,
} from 'lucide-react';

interface ChallengesHubProps {
  onSelectChallenge: (challenge: DailyChallenge) => void;
  onBackToLobby: () => void;
}

export const ChallengesHub: React.FC<ChallengesHubProps> = ({ onSelectChallenge, onBackToLobby }) => {
  const { user } = useContext(AuthContext);

  const todayChallenge = getTodayChallenge();
  const weekChallenges = getWeekChallenges();

  const [countdown, setCountdown] = useState(getTimeUntilNextChallenge());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilNextChallenge());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isTodayCompleted = user.completedChallengeIds.includes(todayChallenge.id);

  // Calculate player rank title based on total points
  const points = user.points || 0;
  const rankTitle =
    points >= 1000
      ? 'Beacon Grandmaster'
      : points >= 600
      ? 'Tactical Master'
      : points >= 300
      ? 'Beacon Knight'
      : 'Novice Challenger';

  const nextTierPoints =
    points >= 1000 ? 1000 : points >= 600 ? 1000 : points >= 300 ? 600 : 300;
  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  return (
    <div className="w-full flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Top Header & Streak Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center">
              <Flame className="w-7 h-7 fill-current animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)] tracking-wider block">
                Daily Streak
              </span>
              <span className="text-2xl font-black text-[var(--theme-text-primary)] font-mono">
                {user.dailyStreak || 1} Days
              </span>
            </div>
          </div>
          <span className="text-xs text-orange-400/90 font-medium">Keep it up!</span>
        </div>

        {/* Challenge Points & Rank Card */}
        <div className="bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)] tracking-wider">
              Total Points & Rank
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">{points} XP</span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-extrabold text-[var(--theme-text-primary)]">{rankTitle}</span>
            <span className="text-[11px] text-[var(--theme-text-secondary)] font-mono">Next tier: {nextTierPoints}</span>
          </div>

          <div className="w-full bg-[var(--theme-bg-canvas)]/80 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-[var(--theme-accent-primary)] to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Countdown to Next Drop */}
        <div className="bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-accent-primary)]/20 text-[var(--theme-accent-primary)] border border-[var(--theme-accent-primary)]/40 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)] tracking-wider block">
                Next Daily Puzzle In
              </span>
              <span className="text-xl font-black text-[var(--theme-text-primary)] font-mono">
                {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Today's Challenge Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[var(--theme-accent-primary)]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[var(--theme-accent-primary)]/20 border border-[var(--theme-accent-primary)]/40 text-[var(--theme-accent-primary)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Today's Daily Challenge
              </span>
              <span className="text-xs text-[var(--theme-text-secondary)] font-mono">{todayChallenge.date}</span>
              {isTodayCompleted && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[var(--theme-text-primary)] tracking-tight">
              {todayChallenge.title}
            </h2>

            <p className="text-sm text-[var(--theme-text-secondary)] mt-2 leading-relaxed">
              {todayChallenge.objective}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">Game:</span>
                <span className="font-semibold text-white">{todayChallenge.gameName}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">Difficulty:</span>
                <span className="font-semibold text-amber-400">{todayChallenge.difficulty}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">Reward:</span>
                <span className="font-bold text-amber-400 font-mono">+{todayChallenge.points} XP</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
            {todayChallenge.badgeReward && (
              <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-2xl">{todayChallenge.badgeReward.icon}</span>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Unlockable Badge
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {todayChallenge.badgeReward.name}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => onSelectChallenge(todayChallenge)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isTodayCompleted ? 'Play Again / Review' : 'Play Challenge Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Challenges Calendar Strip */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--theme-text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--theme-accent-primary)]" />
            <span>Weekly Challenges Archive</span>
          </h3>
          <span className="text-xs text-[var(--theme-text-secondary)]">Explore and solve puzzles from this week</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          {weekChallenges.map((ch) => {
            const isCompleted = user.completedChallengeIds.includes(ch.id);
            const isToday = ch.date === todayChallenge.date;

            return (
              <div
                key={ch.id}
                onClick={() => onSelectChallenge(ch)}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all hover:-translate-y-1 ${
                  isToday
                    ? 'bg-[var(--theme-surface-card)] border-[var(--theme-accent-primary)] ring-2 ring-[var(--theme-accent-primary)]/30'
                    : 'bg-[var(--theme-surface-card)]/80 border-[var(--theme-border-hairline)] hover:border-[var(--theme-accent-primary)]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--theme-text-secondary)]">{ch.dayOfWeek.slice(0, 3)}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-amber-400">+{ch.points}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[var(--theme-text-primary)] mt-1 truncate">{ch.title}</h4>
                  <span className="text-[10px] text-[var(--theme-text-secondary)] block truncate">{ch.gameName}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--theme-border-hairline)] text-[10px]">
                  <span className="text-[var(--theme-text-secondary)]">{ch.difficulty}</span>
                  <span className="text-[var(--theme-accent-primary)] font-semibold">{isCompleted ? 'Review' : 'Play'} →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Trophies Showcase */}
      <div className="flex flex-col gap-4 bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-[var(--theme-text-primary)]">Earned Badges & Honors</h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--theme-bg-canvas)]/80 text-[var(--theme-accent-primary)] border border-[var(--theme-border-hairline)]">
              {user.unlockedBadges.length} / {ALL_BADGES.length} Unlocked
            </span>
          </div>
          <span className="text-xs text-[var(--theme-text-secondary)]">Complete puzzles and milestones to earn</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {ALL_BADGES.map((badge) => {
            const unlockedInstance = user.unlockedBadges.find((b) => b.id === badge.id);
            const isUnlocked = Boolean(unlockedInstance);

            return (
              <Badge
                key={badge.id}
                badge={unlockedInstance || badge}
                isUnlocked={isUnlocked}
                size="md"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChallengesHub;
