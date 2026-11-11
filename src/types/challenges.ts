import { GameId } from '../types';

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: number;
}

export type PuzzleType =
  | 'chess_mate'
  | 'c4_drop'
  | 'ttt_fork'
  | 'checkers_jump'
  | 'memory_blitz'
  | 'sudoku_fill';

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g., "Monday", "Today"
  title: string;
  gameId: GameId;
  gameName: string;
  difficulty: ChallengeDifficulty;
  points: number;
  badgeReward?: Badge;
  objective: string;
  condition: string;
  hint: string;
  puzzleType: PuzzleType;
  puzzleData: any; // specific puzzle configuration/board
}
