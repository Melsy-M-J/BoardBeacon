import { DailyChallenge, Badge } from '../types/challenges';

export const ALL_BADGES: Badge[] = [
  {
    id: 'daily_starter',
    name: 'Daily Spark',
    description: 'Completed your first Daily Challenge on BoardBeacon.',
    icon: '⚡',
    rarity: 'Common',
  },
  {
    id: 'streak_3',
    name: 'Triple Threat',
    description: 'Maintained a 3-day Daily Challenge completion streak.',
    icon: '🔥',
    rarity: 'Rare',
  },
  {
    id: 'streak_7',
    name: 'Weekly Champion',
    description: 'Conquered 7 Daily Challenges in a row without breaking streak.',
    icon: '👑',
    rarity: 'Epic',
  },
  {
    id: 'chess_tactician',
    name: 'Grandmaster Vision',
    description: 'Solved a tactical Chess Checkmate daily puzzle.',
    icon: '♟️',
    rarity: 'Rare',
  },
  {
    id: 'connect_genius',
    name: 'Four-Sight',
    description: 'Engineered a winning Connect Four disc drop in a Daily Challenge.',
    icon: '🎯',
    rarity: 'Rare',
  },
  {
    id: 'fork_master',
    name: 'Master of the Fork',
    description: 'Executed an unstoppable dual-threat fork in Tic-Tac-Toe.',
    icon: '🍴',
    rarity: 'Common',
  },
  {
    id: 'checker_hawk',
    name: 'Crown Reaper',
    description: 'Pulled off a multi-jump sequence to win a Checkers challenge.',
    icon: '🦅',
    rarity: 'Rare',
  },
  {
    id: 'puzzle_perfectionist',
    name: 'Beacon Legend',
    description: 'Accumulated over 1,000 Challenge Points across daily missions.',
    icon: '🏆',
    rarity: 'Legendary',
  },
];

// Pre-defined calendar challenges library
const CHALLENGE_POOL: Omit<DailyChallenge, 'id' | 'date' | 'dayOfWeek'>[] = [
  {
    title: "Scholar's Infiltration",
    gameId: 'chess',
    gameName: 'Chess',
    difficulty: 'Medium',
    points: 150,
    badgeReward: ALL_BADGES.find((b) => b.id === 'chess_tactician'),
    objective: 'White to move. Deliver Checkmate in 1 move!',
    condition: 'Find the lethal Queen strike on the vulnerable f7 square.',
    hint: 'Black left their f7 pawn defended only by their trapped king. Can your Queen strike?',
    puzzleType: 'chess_mate',
    puzzleData: {
      fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
      winningMoves: ['Qxf7#', 'Qxf7+'],
      correctMove: 'Qxf7#',
      from: 'f3',
      to: 'f7',
    },
  },
  {
    title: 'The Unstoppable Corner Fork',
    gameId: 'tic-tac-toe',
    gameName: 'Tic-Tac-Toe',
    difficulty: 'Easy',
    points: 100,
    badgeReward: ALL_BADGES.find((b) => b.id === 'fork_master'),
    objective: 'Create a dual-threat fork in 1 move as X!',
    condition: 'Place X in the optimal square to create 2 simultaneous winning paths.',
    hint: 'Take the top-right corner (R1C3) or bottom-left (R3C1) to bridge two winning diagonals and edges.',
    puzzleType: 'ttt_fork',
    puzzleData: {
      initialBoard: [
        'X', null, null,
        null, 'O', null,
        null, null, 'X',
      ],
      winningIndices: [2, 6], // R1C3 or R3C1
    },
  },
  {
    title: 'The Lethal Drop',
    gameId: 'connect-four',
    gameName: 'Connect Four',
    difficulty: 'Medium',
    points: 120,
    badgeReward: ALL_BADGES.find((b) => b.id === 'connect_genius'),
    objective: 'Drop the winning Yellow disc to connect four in a row!',
    condition: 'Inspect the 7 columns and find the single winning alignment.',
    hint: 'Look closely at row 4 (from bottom) across columns 3, 4, and 5!',
    puzzleType: 'c4_drop',
    puzzleData: {
      winningCol: 2, // 0-indexed column 2 (Col 3)
      board: [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, 'Y', 'Y', 'Y', null], // needs Col 2 (index 2) to complete 4!
        ['R', 'Y', null, 'R', 'R', 'Y', 'R'],
        ['R', 'R', null, 'Y', 'Y', 'R', 'Y'],
      ],
    },
  },
  {
    title: 'The Back-Rank Bolt',
    gameId: 'chess',
    gameName: 'Chess',
    difficulty: 'Easy',
    points: 130,
    badgeReward: ALL_BADGES.find((b) => b.id === 'chess_tactician'),
    objective: 'White to move. Strike with Back-Rank Checkmate in 1 move!',
    condition: 'Exploit Black\'s pawns blocking their king on the 8th rank.',
    hint: 'Move your active Rook all the way to the 8th rank.',
    puzzleType: 'chess_mate',
    puzzleData: {
      fen: '6k1/5ppp/8/8/8/8/4R1PP/6K1 w - - 0 1',
      winningMoves: ['Re8#'],
      correctMove: 'Re8#',
      from: 'e2',
      to: 'e8',
    },
  },
  {
    title: 'The Double Leap',
    gameId: 'checkers',
    gameName: 'Checkers',
    difficulty: 'Hard',
    points: 160,
    badgeReward: ALL_BADGES.find((b) => b.id === 'checker_hawk'),
    objective: 'Perform a multi-jump sequence to capture 2 AI pieces & crown!',
    condition: 'Select your advanced Red piece and leap over both enemy checkers.',
    hint: 'Your piece at (5, 2) can jump diagonally forward-right to (3, 4), then again to (1, 6)!',
    puzzleType: 'checkers_jump',
    puzzleData: {
      targetFrom: [5, 2],
      targetFirstJump: [3, 4],
      targetFinalJump: [1, 6],
    },
  },
  {
    title: 'Smothered King Blitz',
    gameId: 'chess',
    gameName: 'Chess',
    difficulty: 'Hard',
    points: 180,
    badgeReward: ALL_BADGES.find((b) => b.id === 'chess_tactician'),
    objective: 'White to move. Deliver the legendary Smothered Checkmate in 1 move!',
    condition: 'Use your Knight to checkmate a king suffocated by its own friendly pieces.',
    hint: 'Knights can jump over pieces! Find the square checking the King on h8.',
    puzzleType: 'chess_mate',
    puzzleData: {
      fen: '6rk/5Npp/8/8/8/8/6PP/7K w - - 0 1',
      winningMoves: ['Nh6#', 'Nf7#'],
      correctMove: 'Nf7#',
      from: 'f7',
      to: 'f7', // or knight already poised
    },
  },
  {
    title: 'Keystone Number Matrix',
    gameId: 'sudoku',
    gameName: 'Sudoku',
    difficulty: 'Medium',
    points: 140,
    badgeReward: ALL_BADGES.find((b) => b.id === 'daily_starter'),
    objective: 'Complete the key central 3x3 block without duplicate numbers!',
    condition: 'Place numbers 3, 7, and 9 in their precise vacant cells.',
    hint: 'Check horizontal rows to see which rows already contain a 7.',
    puzzleType: 'sudoku_fill',
    puzzleData: {},
  },
];

// Helper to get formatted date string YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get deterministic challenge for a given Date
export function getChallengeForDate(dateObj: Date): DailyChallenge {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Deterministic seed based on day number
  const dayOfYear = Math.floor(
    (dateObj.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const index = Math.abs(dayOfYear) % CHALLENGE_POOL.length;
  const template = CHALLENGE_POOL[index];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = daysOfWeek[dateObj.getDay()];

  return {
    ...template,
    id: `dc_${dateStr}`,
    date: dateStr,
    dayOfWeek,
  };
}

// Get today's challenge
export function getTodayChallenge(): DailyChallenge {
  return getChallengeForDate(new Date());
}

// Get challenges for the current week (7 days)
export function getWeekChallenges(): DailyChallenge[] {
  const list: DailyChallenge[] = [];
  const today = new Date();

  // Get Monday of current week
  const currentDay = today.getDay(); // 0 is Sunday
  const diffToMonday = (currentDay + 6) % 7; // distance back to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);

  for (let i = 0; i < 7; i++) {
    const target = new Date(monday);
    target.setDate(monday.getDate() + i);
    list.push(getChallengeForDate(target));
  }

  return list;
}

// Format seconds into HH:MM:SS until tomorrow midnight
export function getTimeUntilNextChallenge(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diffMs = tomorrow.getTime() - now.getTime();
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { hours, minutes, seconds };
}
