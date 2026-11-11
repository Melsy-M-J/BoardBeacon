import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  MoveRecord,
  GameResult,
  CellHighlight,
  PlaybackSpeed,
  MoveRecorderControls,
} from '../types/recorder';

interface UseMoveRecorderOptions<TBoardState> {
  gameId: string;
  gameName: string;
  initialBoard: TBoardState;
  onGameEnd?: (result: GameResult, moves: MoveRecord<TBoardState>[]) => void;
}

export function useMoveRecorder<TBoardState>({
  gameId,
  gameName,
  initialBoard,
  onGameEnd,
}: UseMoveRecorderOptions<TBoardState>): MoveRecorderControls<TBoardState> {
  const [moves, setMoves] = useState<MoveRecord<TBoardState>[]>([]);
  const [baseInitialBoard, setBaseInitialBoard] = useState<TBoardState>(() =>
    structuredCloneSafely(initialBoard)
  );
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Review states
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  const startTimeRef = useRef<number>(Date.now());
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper for deep cloning without failing on standard objects
  function structuredCloneSafely<T>(item: T): T {
    try {
      if (typeof window !== 'undefined' && typeof window.structuredClone === 'function') {
        return window.structuredClone(item);
      }
      return JSON.parse(JSON.stringify(item));
    } catch {
      return item;
    }
  }

  // Clear autoplay timer on unmount or pause
  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAutoplay();
    };
  }, [stopAutoplay]);

  // Record a new move during live play
  const recordMove = useCallback(
    (moveData: {
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
    }) => {
      setMoves((prevMoves) => {
        const stepNumber = prevMoves.length + 1;
        // Calculate turn number (every 2 half-moves usually = 1 round)
        const turnNumber = Math.ceil(stepNumber / 2);
        const newRecord: MoveRecord<TBoardState> = {
          id: `move_${stepNumber}_${Date.now()}`,
          stepNumber,
          turnNumber,
          player: moveData.player,
          playerName: moveData.playerName,
          playerType: moveData.playerType,
          notation: moveData.notation,
          action: moveData.action || 'Move',
          description: moveData.description,
          timestamp: Date.now(),
          boardSnapshot: structuredCloneSafely(moveData.boardSnapshot),
          highlightCells: moveData.highlightCells || [],
          captured: moveData.captured,
          metadata: moveData.metadata,
        };
        return [...prevMoves, newRecord];
      });
    },
    []
  );

  // Finish game
  const finishGame = useCallback(
    (result: {
      winner: 'player1' | 'player2' | 'ai' | 'draw' | null;
      winnerName?: string;
      reason: string;
    }) => {
      const now = Date.now();
      const durationSeconds = Math.max(1, Math.round((now - startTimeRef.current) / 1000));
      const finalResult: GameResult = {
        status: 'completed',
        winner: result.winner,
        winnerName: result.winnerName,
        reason: result.reason,
        startedAt: startTimeRef.current,
        endedAt: now,
        totalTurns: moves.length,
        durationSeconds,
      };

      setIsGameOver(true);
      setGameResult(finalResult);
      if (onGameEnd) {
        onGameEnd(finalResult, moves);
      }
    },
    [moves, onGameEnd]
  );

  // Reset entire recorder for a new game
  const resetGame = useCallback(
    (newInitialBoard: TBoardState) => {
      stopAutoplay();
      setMoves([]);
      const clonedInitial = structuredCloneSafely(newInitialBoard);
      setBaseInitialBoard(clonedInitial);
      setIsGameOver(false);
      setGameResult(null);
      setIsReviewMode(false);
      setCurrentStepIndex(-1);
      startTimeRef.current = Date.now();
    },
    [stopAutoplay]
  );

  // Enter review mode
  const startReview = useCallback(
    (targetStepIndex?: number) => {
      stopAutoplay();
      setIsReviewMode(true);
      // Default to final move if moves exist, otherwise start
      const target =
        targetStepIndex !== undefined
          ? targetStepIndex
          : moves.length > 0
          ? moves.length - 1
          : -1;
      setCurrentStepIndex(target);
    },
    [moves.length, stopAutoplay]
  );

  // Exit review mode
  const exitReview = useCallback(() => {
    stopAutoplay();
    setIsReviewMode(false);
    setCurrentStepIndex(moves.length > 0 ? moves.length - 1 : -1);
  }, [moves.length, stopAutoplay]);

  const toggleReview = useCallback(() => {
    if (isReviewMode) {
      exitReview();
    } else {
      startReview();
    }
  }, [isReviewMode, exitReview, startReview]);

  // Navigation
  const goToStep = useCallback(
    (index: number) => {
      stopAutoplay();
      const clamped = Math.max(-1, Math.min(moves.length - 1, index));
      setCurrentStepIndex(clamped);
    },
    [moves.length, stopAutoplay]
  );

  const goToFirst = useCallback(() => {
    goToStep(-1);
  }, [goToStep]);

  const goToPrevious = useCallback(() => {
    goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  const goToNext = useCallback(() => {
    goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep]);

  const goToLast = useCallback(() => {
    goToStep(moves.length - 1);
  }, [moves.length, goToStep]);

  // Autoplay loop
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAutoplay();
    } else {
      if (moves.length === 0) return;
      // If at end, wrap around to initial state
      if (currentStepIndex >= moves.length - 1) {
        setCurrentStepIndex(-1);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, moves.length, currentStepIndex, stopAutoplay]);

  useEffect(() => {
    if (!isPlaying) return;

    const baseDelay = 1200; // ms per move at 1x
    const delay = Math.round(baseDelay / playbackSpeed);

    autoplayTimerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= moves.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, delay);

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, moves.length, playbackSpeed]);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
  }, []);

  // Compute active board snapshot and highlights
  const activeSnapshot = useMemo<TBoardState>(() => {
    if (!isReviewMode) {
      // In live mode, return either last move snapshot or initial board
      if (moves.length > 0) {
        return moves[moves.length - 1].boardSnapshot;
      }
      return baseInitialBoard;
    }

    if (currentStepIndex === -1 || moves.length === 0) {
      return baseInitialBoard;
    }
    const safeIndex = Math.min(currentStepIndex, moves.length - 1);
    return moves[safeIndex].boardSnapshot;
  }, [isReviewMode, currentStepIndex, moves, baseInitialBoard]);

  const activeMove = useMemo<MoveRecord<TBoardState> | null>(() => {
    if (currentStepIndex < 0 || currentStepIndex >= moves.length) {
      return null;
    }
    return moves[currentStepIndex];
  }, [currentStepIndex, moves]);

  const activeHighlights = useMemo<CellHighlight[]>(() => {
    if (activeMove && activeMove.highlightCells) {
      return activeMove.highlightCells;
    }
    return [];
  }, [activeMove]);

  // Export transcript as readable plain text
  const exportTranscript = useCallback(() => {
    const lines: string[] = [];
    lines.push(`=========================================`);
    lines.push(`  BoardBeacon Match Transcript`);
    lines.push(`  Game: ${gameName} (${gameId})`);
    lines.push(`  Date: ${new Date(startTimeRef.current).toLocaleString()}`);
    if (gameResult) {
      lines.push(`  Result: ${gameResult.winnerName || gameResult.winner || 'Draw'}`);
      lines.push(`  Reason: ${gameResult.reason}`);
      lines.push(`  Duration: ${gameResult.durationSeconds}s`);
    }
    lines.push(`  Total Moves: ${moves.length}`);
    lines.push(`=========================================\n`);
    lines.push(`MOVE HISTORY:`);

    moves.forEach((m) => {
      const timeOffset = Math.round((m.timestamp - startTimeRef.current) / 1000);
      lines.push(
        `#${m.stepNumber.toString().padStart(2, ' ')} [${m.playerName}]: ${m.notation} - ${m.description} (+${timeOffset}s)`
      );
    });

    lines.push(`\n[End of Match Log]`);
    return lines.join('\n');
  }, [gameId, gameName, gameResult, moves]);

  const copyTranscriptToClipboard = useCallback(async () => {
    try {
      const text = exportTranscript();
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, [exportTranscript]);

  return {
    moves,
    initialBoard: baseInitialBoard,
    currentStepIndex,
    isReviewMode,
    isPlaying,
    playbackSpeed,
    isGameOver,
    gameResult,
    activeSnapshot,
    activeMove,
    activeHighlights,
    hasMoves: moves.length > 0,
    isAtStart: currentStepIndex <= -1,
    isAtEnd: currentStepIndex >= moves.length - 1,
    recordMove,
    finishGame,
    resetGame,
    startReview,
    exitReview,
    toggleReview,
    goToStep,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLast,
    togglePlay,
    setSpeed,
    exportTranscript,
    copyTranscriptToClipboard,
  };
}
