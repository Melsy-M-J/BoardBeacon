import React from 'react';
export * from './types/recorder';
export * from './types/challenges';
export * from './types/theme';
import { Badge } from './types/challenges';
import { ThemeId } from './types/theme';

export type GameId =
  | 'tic-tac-toe'
  | 'connect-four'
  | 'checkers'
  | 'chess'
  | 'memory-game'
  | 'sudoku'
  | 'ludo'
  | 'snake-and-ladder'
  | 'mahjong';

export interface GameComponentProps {
  onBackToLobby: () => void;
  gameName: string;
}

export interface Game {
  id: GameId;
  name: string;
  description: string;
  category?: 'Strategy' | 'Classic' | 'Puzzle' | 'Casual';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  players?: string;
  component: React.ComponentType<GameComponentProps>;
  icon: React.ComponentType<{ className?: string }>;
  isComingSoon?: boolean;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  winStreak: number;
  bestStreak: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  soundEnabled: boolean;
  theme?: ThemeId;
  points: number;
  dailyStreak: number;
  lastChallengeDate?: string;
  completedChallengeIds: string[];
  unlockedBadges: Badge[];
  stats: Record<GameId, UserStats>;
  globalStats: UserStats;
  recentGames: Array<{
    id: string;
    gameId: GameId;
    gameName: string;
    date: number;
    result: 'win' | 'loss' | 'draw';
    turns: number;
    durationSeconds: number;
    moveHistorySummary?: string[];
  }>;
}
