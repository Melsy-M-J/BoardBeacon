import React, { createContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, GameId, UserStats, DailyChallenge, Badge, ThemeId } from '../types';
import { ALL_BADGES, getTodayDateString } from '../services/challengeService';

interface AuthContextType {
  user: UserProfile;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  updateUsername: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  updateTheme: (theme: ThemeId) => void;
  toggleSound: () => void;
  deleteAccount: () => void;
  recordMatchResult: (params: {
    gameId: GameId;
    gameName: string;
    result: 'win' | 'loss' | 'draw';
    turns: number;
    durationSeconds: number;
    moveHistorySummary?: string[];
  }) => void;
  completeDailyChallenge: (challenge: DailyChallenge) => {
    pointsAwarded: number;
    newBadges: Badge[];
    newStreak: number;
  };
}

const defaultStats: UserStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  gamesDrawn: 0,
  winStreak: 0,
  bestStreak: 0,
};

const initialProfile: UserProfile = {
  id: 'player_1',
  username: 'Challenger',
  avatar: '🎲',
  soundEnabled: true,
  points: 120, // Starting bonus points
  dailyStreak: 1,
  completedChallengeIds: [],
  unlockedBadges: [
    { ...ALL_BADGES[0], unlockedAt: Date.now() - 86400000 }, // initial badge preview
  ],
  globalStats: { ...defaultStats },
  stats: {
    'tic-tac-toe': { ...defaultStats },
    'connect-four': { ...defaultStats },
    'checkers': { ...defaultStats },
    'chess': { ...defaultStats },
    'memory-game': { ...defaultStats },
    'sudoku': { ...defaultStats },
    'ludo': { ...defaultStats },
    'snake-and-ladder': { ...defaultStats },
    'mahjong': { ...defaultStats },
  },
  recentGames: [],
};

export const AuthContext = createContext<AuthContextType>({
  user: initialProfile,
  isAuthModalOpen: false,
  setAuthModalOpen: () => {},
  updateUsername: () => {},
  updateAvatar: () => {},
  updateTheme: () => {},
  toggleSound: () => {},
  deleteAccount: () => {},
  recordMatchResult: () => {},
  completeDailyChallenge: () => ({ pointsAwarded: 0, newBadges: [], newStreak: 1 }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('boardbeacon_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialProfile,
          ...parsed,
          points: parsed.points !== undefined ? parsed.points : initialProfile.points,
          dailyStreak: parsed.dailyStreak !== undefined ? parsed.dailyStreak : initialProfile.dailyStreak,
          completedChallengeIds: parsed.completedChallengeIds || [],
          unlockedBadges: parsed.unlockedBadges || initialProfile.unlockedBadges,
        };
      }
    } catch {}
    return initialProfile;
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('boardbeacon_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  const updateUsername = useCallback((username: string) => {
    setUser((prev) => ({ ...prev, username }));
  }, []);

  const updateAvatar = useCallback((avatar: string) => {
    setUser((prev) => ({ ...prev, avatar }));
  }, []);

  const updateTheme = useCallback((theme: ThemeId) => {
    setUser((prev) => ({ ...prev, theme }));
  }, []);

  const toggleSound = useCallback(() => {
    setUser((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const deleteAccount = useCallback(() => {
    try {
      localStorage.removeItem('boardbeacon_user');
      localStorage.removeItem('boardbeacon_matches');
    } catch {}
    setUser({ ...initialProfile, id: `player_${Date.now()}` });
  }, []);

  const recordMatchResult = useCallback(
    ({
      gameId,
      gameName,
      result,
      turns,
      durationSeconds,
      moveHistorySummary,
    }: {
      gameId: GameId;
      gameName: string;
      result: 'win' | 'loss' | 'draw';
      turns: number;
      durationSeconds: number;
      moveHistorySummary?: string[];
    }) => {
      setUser((prev) => {
        const gameStats = prev.stats[gameId] || { ...defaultStats };
        const gStats = prev.globalStats || { ...defaultStats };

        const won = result === 'win';
        const lost = result === 'loss';
        const drawn = result === 'draw';

        const newGameStats: UserStats = {
          gamesPlayed: gameStats.gamesPlayed + 1,
          gamesWon: gameStats.gamesWon + (won ? 1 : 0),
          gamesLost: gameStats.gamesLost + (lost ? 1 : 0),
          gamesDrawn: gameStats.gamesDrawn + (drawn ? 1 : 0),
          winStreak: won ? gameStats.winStreak + 1 : 0,
          bestStreak: won
            ? Math.max(gameStats.bestStreak, gameStats.winStreak + 1)
            : gameStats.bestStreak,
        };

        const newGlobalStats: UserStats = {
          gamesPlayed: gStats.gamesPlayed + 1,
          gamesWon: gStats.gamesWon + (won ? 1 : 0),
          gamesLost: gStats.gamesLost + (lost ? 1 : 0),
          gamesDrawn: gStats.gamesDrawn + (drawn ? 1 : 0),
          winStreak: won ? gStats.winStreak + 1 : 0,
          bestStreak: won
            ? Math.max(gStats.bestStreak, gStats.winStreak + 1)
            : gStats.bestStreak,
        };

        const newRecentGame = {
          id: `match_${Date.now()}`,
          gameId,
          gameName,
          date: Date.now(),
          result,
          turns,
          durationSeconds,
          moveHistorySummary,
        };

        return {
          ...prev,
          globalStats: newGlobalStats,
          stats: {
            ...prev.stats,
            [gameId]: newGameStats,
          },
          recentGames: [newRecentGame, ...prev.recentGames.slice(0, 19)],
        };
      });
    },
    []
  );

  const completeDailyChallenge = useCallback(
    (challenge: DailyChallenge) => {
      const today = getTodayDateString();
      const pointsToAward = challenge.points || 100;
      const newlyEarnedBadges: Badge[] = [];

      let resultingStreak = user.dailyStreak;

      setUser((prev) => {
        // If already completed this specific challenge id, don't duplicate points
        if (prev.completedChallengeIds.includes(challenge.id)) {
          return prev;
        }

        // Calculate streak
        let newStreak = prev.dailyStreak;
        if (!prev.lastChallengeDate) {
          newStreak = 1;
        } else if (prev.lastChallengeDate === today) {
          // already did a challenge today
          newStreak = prev.dailyStreak;
        } else {
          // Check if yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
          if (prev.lastChallengeDate === yStr) {
            newStreak = prev.dailyStreak + 1;
          } else {
            newStreak = 1; // broken streak
          }
        }
        resultingStreak = newStreak;

        const updatedPoints = (prev.points || 0) + pointsToAward;
        const currentBadges = [...prev.unlockedBadges];

        // Check challenge badge reward
        if (challenge.badgeReward && !currentBadges.some((b) => b.id === challenge.badgeReward!.id)) {
          const b = { ...challenge.badgeReward, unlockedAt: Date.now() };
          currentBadges.push(b);
          newlyEarnedBadges.push(b);
        }

        // Check Streak badges
        if (newStreak >= 3 && !currentBadges.some((b) => b.id === 'streak_3')) {
          const b = { ...ALL_BADGES.find((x) => x.id === 'streak_3')!, unlockedAt: Date.now() };
          currentBadges.push(b);
          newlyEarnedBadges.push(b);
        }
        if (newStreak >= 7 && !currentBadges.some((b) => b.id === 'streak_7')) {
          const b = { ...ALL_BADGES.find((x) => x.id === 'streak_7')!, unlockedAt: Date.now() };
          currentBadges.push(b);
          newlyEarnedBadges.push(b);
        }

        // Check points badge
        if (updatedPoints >= 1000 && !currentBadges.some((b) => b.id === 'puzzle_perfectionist')) {
          const b = { ...ALL_BADGES.find((x) => x.id === 'puzzle_perfectionist')!, unlockedAt: Date.now() };
          currentBadges.push(b);
          newlyEarnedBadges.push(b);
        }

        return {
          ...prev,
          points: updatedPoints,
          dailyStreak: newStreak,
          lastChallengeDate: today,
          completedChallengeIds: [...prev.completedChallengeIds, challenge.id],
          unlockedBadges: currentBadges,
        };
      });

      return {
        pointsAwarded: pointsToAward,
        newBadges: newlyEarnedBadges,
        newStreak: resultingStreak,
      };
    },
    [user.dailyStreak]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setAuthModalOpen,
        updateUsername,
        updateAvatar,
        updateTheme,
        toggleSound,
        deleteAccount,
        recordMatchResult,
        completeDailyChallenge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
