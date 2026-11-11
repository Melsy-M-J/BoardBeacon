export interface CellHighlight {
  row?: number;
  col?: number;
  index?: number;
  key?: string;
  type?: 'from' | 'to' | 'placed' | 'captured' | 'selected' | 'win_line';
}

export interface MoveRecord<TBoardState = any> {
  id: string;
  stepNumber: number; // 1, 2, 3...
  turnNumber: number; // 1, 1, 2, 2...
  player: 'player1' | 'player2' | 'ai' | string;
  playerName: string;
  playerType: 'human' | 'ai';
  notation: string; // e.g., "e4", "R2, C1", "Drop Col 4"
  action: string; // "Place Mark", "Capture", "Jump", "Check"
  description: string; // Detailed narration
  timestamp: number;
  boardSnapshot: TBoardState; // Exact immutable snapshot of the board after this move
  highlightCells?: CellHighlight[];
  captured?: string | string[];
  metadata?: Record<string, any>;
}

export interface GameResult {
  status: 'in_progress' | 'completed' | 'abandoned';
  winner: 'player1' | 'player2' | 'ai' | 'draw' | null;
  winnerName?: string;
  reason: string;
  startedAt: number;
  endedAt?: number;
  totalTurns: number;
  durationSeconds: number;
}

export interface SavedGameMatch<TBoardState = any> {
  id: string;
  gameId: string;
  gameName: string;
  startedAt: number;
  finishedAt: number;
  initialBoard: TBoardState;
  moves: MoveRecord<TBoardState>[];
  result: GameResult;
  player1Name: string;
  player2Name: string;
}

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export interface MoveRecorderControls<TBoardState = any> {
  // State
  moves: MoveRecord<TBoardState>[];
  initialBoard: TBoardState;
  currentStepIndex: number; // -1 for initial board, 0..moves.length-1
  isReviewMode: boolean;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  isGameOver: boolean;
  gameResult: GameResult | null;
  
  // Active state derived
  activeSnapshot: TBoardState;
  activeMove: MoveRecord<TBoardState> | null;
  activeHighlights: CellHighlight[];
  hasMoves: boolean;
  isAtStart: boolean;
  isAtEnd: boolean;

  // Actions
  recordMove: (move: {
    player: 'player1' | 'player2' | 'ai' | string;
    playerName: string;
    playerType: 'human' | 'ai';
    notation: string;
    action?: string;
    description: string;
    boardSnapshot: TBoardState;
    highlightCells?: CellHighlight[];
    captured?: string | string[];
    metadata?: Record<string, any>;
  }) => void;
  finishGame: (result: {
    winner: 'player1' | 'player2' | 'ai' | 'draw' | null;
    winnerName?: string;
    reason: string;
  }) => void;
  resetGame: (newInitialBoard: TBoardState) => void;
  
  // Review navigation
  startReview: (targetStepIndex?: number) => void;
  exitReview: () => void;
  toggleReview: () => void;
  goToStep: (index: number) => void;
  goToFirst: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToLast: () => void;
  togglePlay: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  exportTranscript: () => string;
  copyTranscriptToClipboard: () => Promise<boolean>;
}
