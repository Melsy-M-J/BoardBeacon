import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Chess } from 'chess.js';
import { DailyChallenge, Badge as BadgeType } from '../../types/challenges';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';
import {
  Trophy,
  Flame,
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  Award,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Badge from '../Badge';

interface DailyChallengeViewProps {
  challenge: DailyChallenge;
  onBack: () => void;
}

const PIECE_SYMBOLS: Record<string, string> = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({ challenge, onBack }) => {
  const { playMoveSound, playWinSound, playLoseSound, soundEnabled, toggleSound } =
    useContext(GameAudioContext);
  const { user, completeDailyChallenge } = useContext(AuthContext);

  const [showHint, setShowHint] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [newStreak, setNewStreak] = useState<number>(user.dailyStreak);

  // Chess puzzle state
  const [chessInstance, setChessInstance] = useState(() => {
    if (challenge.puzzleType === 'chess_mate' && challenge.puzzleData?.fen) {
      try {
        return new Chess(challenge.puzzleData.fen);
      } catch {}
    }
    return new Chess();
  });
  const [selectedChessSquare, setSelectedChessSquare] = useState<string | null>(null);
  const [legalChessMoves, setLegalChessMoves] = useState<string[]>([]);

  // Tic-Tac-Toe puzzle state
  const [tttBoard, setTttBoard] = useState<(string | null)[]>(() => {
    if (challenge.puzzleType === 'ttt_fork' && challenge.puzzleData?.initialBoard) {
      return [...challenge.puzzleData.initialBoard];
    }
    return Array(9).fill(null);
  });

  // Connect Four puzzle state
  const [c4Board, setC4Board] = useState<(string | null)[][]>(() => {
    if (challenge.puzzleType === 'c4_drop' && challenge.puzzleData?.board) {
      return challenge.puzzleData.board.map((row: any[]) => [...row]);
    }
    return Array.from({ length: 6 }, () => Array(7).fill(null));
  });

  // Checkers puzzle state
  const [checkersStep, setCheckersStep] = useState<number>(0);

  // Move recorder base hook
  const recorder = useMoveRecorder<any>({
    gameId: challenge.gameId,
    gameName: `Daily: ${challenge.title}`,
    initialBoard: challenge.puzzleData,
    onGameEnd: (result) => {
      if (result.winner === 'player1') {
        playWinSound();
      }
    },
  });

  const handleChallengeSuccess = (moveNotation: string, moveDesc: string) => {
    setIsSuccess(true);
    playWinSound();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
      });
    } catch {}

    const result = completeDailyChallenge(challenge);
    setEarnedPoints(result.pointsAwarded);
    setEarnedBadges(result.newBadges);
    setNewStreak(result.newStreak);

    recorder.recordMove({
      player: 'player1',
      playerName: 'You (Challenger)',
      playerType: 'human',
      notation: moveNotation,
      action: 'Challenge Solved',
      description: moveDesc,
      boardSnapshot: { solved: true },
    });

    recorder.finishGame({
      winner: 'player1',
      winnerName: 'You',
      reason: `Daily Challenge Solved! (${challenge.title})`,
    });
  };

  // 1. Chess Mate Move Handler
  const handleChessSquareClick = (squareKey: string) => {
    if (recorder.isReviewMode || isSuccess) return;

    const piece = chessInstance.get(squareKey as any);
    if (piece && piece.color === 'w') {
      setSelectedChessSquare(squareKey);
      const moves = chessInstance.moves({ square: squareKey as any, verbose: true });
      setLegalChessMoves(moves.map((m) => m.to));
      return;
    }

    if (selectedChessSquare && legalChessMoves.includes(squareKey)) {
      const copy = new Chess(chessInstance.fen());
      const moveResult = copy.move({
        from: selectedChessSquare,
        to: squareKey,
        promotion: 'q',
      });

      if (moveResult) {
        setChessInstance(copy);
        setSelectedChessSquare(null);
        setLegalChessMoves([]);
        playMoveSound('place');

        // Check if move is checkmate or matches required winning move
        const isMate = copy.isCheckmate();
        const matchesTarget =
          challenge.puzzleData?.winningMoves?.includes(moveResult.san) ||
          (challenge.puzzleData?.from === selectedChessSquare && challenge.puzzleData?.to === squareKey);

        if (isMate || matchesTarget) {
          handleChallengeSuccess(moveResult.san, `Delivered Checkmate with ${moveResult.san}!`);
        } else {
          setFeedbackMsg(
            `Good try (${moveResult.san}), but that did not achieve checkmate in 1 move. Reset position to try again!`
          );
          playLoseSound();
        }
      }
    } else {
      setSelectedChessSquare(null);
      setLegalChessMoves([]);
    }
  };

  // 2. Tic-Tac-Toe Fork Move Handler
  const handleTttCellClick = (idx: number) => {
    if (recorder.isReviewMode || isSuccess || tttBoard[idx] !== null) return;

    const newBoard = [...tttBoard];
    newBoard[idx] = 'X';
    setTttBoard(newBoard);
    playMoveSound('place');

    const winningIndices: number[] = challenge.puzzleData?.winningIndices || [2, 6];
    if (winningIndices.includes(idx)) {
      const row = Math.floor(idx / 3) + 1;
      const col = (idx % 3) + 1;
      handleChallengeSuccess(
        `R${row}C${col} [Fork]`,
        `Placed X at R${row}C${col} creating two simultaneous winning lines!`
      );
    } else {
      setFeedbackMsg('That cell does not create a dual fork. AI can easily block. Try again!');
      playLoseSound();
    }
  };

  // 3. Connect Four Drop Handler
  const handleC4ColClick = (col: number) => {
    if (recorder.isReviewMode || isSuccess) return;

    const winCol = challenge.puzzleData?.winningCol ?? 2;
    // Find lowest empty
    let targetRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (c4Board[r][col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    const newBoard = c4Board.map((row) => [...row]);
    newBoard[targetRow][col] = 'Y';
    setC4Board(newBoard);
    playMoveSound('place');

    if (col === winCol) {
      handleChallengeSuccess(`Drop Col ${col + 1}`, `Dropped Yellow disc into Column ${col + 1} to align 4-in-a-row!`);
    } else {
      setFeedbackMsg(`Column ${col + 1} did not create the 4-in-a-row connection. Reset to try again!`);
      playLoseSound();
    }
  };

  const handleResetPuzzle = () => {
    setIsSuccess(false);
    setFeedbackMsg(null);
    if (challenge.puzzleType === 'chess_mate' && challenge.puzzleData?.fen) {
      setChessInstance(new Chess(challenge.puzzleData.fen));
      setSelectedChessSquare(null);
      setLegalChessMoves([]);
    } else if (challenge.puzzleType === 'ttt_fork' && challenge.puzzleData?.initialBoard) {
      setTttBoard([...challenge.puzzleData.initialBoard]);
    } else if (challenge.puzzleType === 'c4_drop' && challenge.puzzleData?.board) {
      setC4Board(challenge.puzzleData.board.map((r: any[]) => [...r]));
    }
    recorder.resetGame(challenge.puzzleData);
  };

  const isAlreadyCompleted = user.completedChallengeIds.includes(challenge.id);

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-fade-in pb-12">
      {/* Top Banner with Challenge Info */}
      <div className="w-full bg-[var(--theme-surface-card)] backdrop-blur-md border border-[var(--theme-border-hairline)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-[var(--theme-bg-canvas)]/80 text-[var(--theme-text-primary)] hover:border-[var(--theme-accent-primary)] border border-[var(--theme-border-hairline)] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hub</span>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Daily Mission · {challenge.dayOfWeek}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  challenge.difficulty === 'Hard'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : challenge.difficulty === 'Medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {challenge.difficulty}
              </span>
              {isAlreadyCompleted && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--theme-text-primary)] mt-1">
              {challenge.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--theme-accent-primary)] font-medium mt-0.5">
              🎯 {challenge.objective}
            </p>
          </div>
        </div>

        {/* Rewards pill */}
        <div className="flex items-center gap-3 bg-[var(--theme-bg-canvas)]/80 p-3 rounded-2xl border border-[var(--theme-border-hairline)]">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)] block">Reward</span>
            <span className="text-sm font-extrabold text-amber-400 font-mono">
              +{challenge.points} XP
            </span>
          </div>

          {challenge.badgeReward && (
            <div className="border-l border-[var(--theme-border-hairline)] pl-3 flex items-center gap-2">
              <span className="text-2xl">{challenge.badgeReward.icon}</span>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] uppercase font-bold text-[var(--theme-text-secondary)] block">Badge</span>
                <span className="text-xs font-bold text-[var(--theme-text-primary)]">
                  {challenge.badgeReward.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Objective & Feedback Banner */}
      <div className="w-full max-w-xl flex flex-col gap-2">
        <div className="bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="text-[var(--theme-text-primary)] leading-relaxed">
            <strong>Condition:</strong> {challenge.condition}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--theme-bg-canvas)] text-[var(--theme-text-primary)] hover:border-[var(--theme-accent-primary)] flex items-center gap-1.5 border border-[var(--theme-border-hairline)] text-xs transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[var(--theme-accent-primary)]" />
              <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
            </button>
            <button
              onClick={handleResetPuzzle}
              className="p-1.5 rounded-lg bg-[var(--theme-bg-canvas)] text-[var(--theme-text-primary)] hover:border-[var(--theme-accent-primary)] border border-[var(--theme-border-hairline)] transition-colors"
              title="Reset Puzzle"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showHint && (
          <div className="p-3 bg-[var(--theme-accent-primary)]/15 border border-[var(--theme-accent-primary)]/40 rounded-xl text-xs text-[var(--theme-text-primary)] animate-slide-in-up">
            💡 <strong>Hint:</strong> {challenge.hint}
          </div>
        )}

        {feedbackMsg && !isSuccess && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center justify-between gap-2 animate-shake">
            <span>{feedbackMsg}</span>
            <button
              onClick={handleResetPuzzle}
              className="px-2 py-1 rounded bg-rose-500/20 text-rose-200 font-bold hover:bg-rose-500/30 text-[11px]"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Main Puzzle Interactive Stage */}
      <div className="w-full flex justify-center">
        {/* Case 1: Chess Mate in 1 Puzzle - Strictly Square */}
        {challenge.puzzleType === 'chess_mate' && (
          <div className="w-full max-w-[min(88vw,440px)] aspect-square p-2 sm:p-3 bg-[var(--theme-board-casing)] rounded-3xl border border-[var(--theme-border-hairline)] shadow-2xl relative overflow-hidden flex items-center justify-center">
            <div className="grid grid-cols-8 grid-rows-8 gap-0 border-2 border-[var(--theme-border-hairline)] rounded-2xl overflow-hidden w-full h-full aspect-square relative">
              {chessInstance.board().map((row, r) =>
                row.map((cell, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const file = String.fromCharCode(97 + c);
                  const rank = (8 - r).toString();
                  const squareKey = `${file}${rank}`;
                  const isSelected = selectedChessSquare === squareKey;
                  const isLegalMove = legalChessMoves.includes(squareKey);
                  const pieceKey = cell ? `${cell.color}${cell.type}` : null;
                  const symbol = pieceKey ? PIECE_SYMBOLS[pieceKey] : null;

                  return (
                    <div
                      key={squareKey}
                      onClick={() => handleChessSquareClick(squareKey)}
                      className={`aspect-square w-full h-full relative flex items-center justify-center select-none overflow-hidden transition-all ${
                        isSelected ? 'ring-2 ring-[var(--theme-accent-primary)] z-10' : ''
                      } ${
                        cell?.color === 'w' ? 'cursor-pointer hover:brightness-110' : ''
                      } ${isLegalMove ? 'cursor-pointer' : ''}`}
                      style={{
                        backgroundColor: isLight ? 'var(--theme-cell-light)' : 'var(--theme-cell-dark)',
                        color: isLight ? 'var(--theme-text-primary)' : 'var(--theme-text-primary)',
                      }}
                    >
                      {/* Square label */}
                      {c === 0 && (
                        <span className="absolute top-0.5 left-1 text-[8px] font-mono opacity-50 font-bold leading-none">
                          {rank}
                        </span>
                      )}
                      {r === 7 && (
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-mono opacity-50 font-bold leading-none">
                          {file}
                        </span>
                      )}

                      {/* Legal target dot */}
                      {isLegalMove && !cell && (
                        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-900/50" />
                      )}

                      {symbol && (
                        <span
                          className={`absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl leading-none pointer-events-none ${
                            cell?.color === 'w'
                              ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                              : 'text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                          }`}
                        >
                          {symbol}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Case 2: Tic-Tac-Toe Fork Puzzle - Strictly Square */}
        {challenge.puzzleType === 'ttt_fork' && (
          <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center p-3 sm:p-4 bg-[var(--theme-board-casing)] rounded-3xl border border-[var(--theme-border-hairline)] shadow-2xl overflow-hidden">
            <div className="grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3 w-full h-full aspect-square">
              {tttBoard.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTttCellClick(idx)}
                  disabled={val !== null || isSuccess}
                  className={`aspect-square w-full h-full relative rounded-2xl flex items-center justify-center select-none overflow-hidden border transition-all ${
                    val === 'X'
                      ? 'border-[var(--theme-accent-primary)]/50'
                      : val === 'O'
                      ? 'border-rose-400/50'
                      : 'hover:border-[var(--theme-accent-primary)]/60 cursor-pointer active:scale-95'
                  }`}
                  style={{
                    backgroundColor: 'var(--theme-cell-light)',
                    borderColor: 'var(--theme-border-hairline)',
                    color: val === 'X' ? 'var(--theme-accent-primary)' : 'var(--theme-piece-opponent)',
                  }}
                >
                  {val && (
                    <span className="absolute inset-0 flex items-center justify-center font-extrabold text-4xl sm:text-5xl leading-none pointer-events-none animate-pop-in">
                      {val}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Case 3: Connect Four Drop Puzzle - Strictly Square */}
        {challenge.puzzleType === 'c4_drop' && (
          <div className="flex flex-col items-center gap-3 w-full max-w-lg">
            {/* Column selection arrow buttons */}
            <div className="grid grid-cols-7 gap-2 w-full max-w-sm px-3">
              {Array.from({ length: 7 }).map((_, c) => (
                <button
                  key={c}
                  onClick={() => handleC4ColClick(c)}
                  disabled={isSuccess}
                  className="h-8 rounded-lg bg-[var(--theme-surface-card)] hover:bg-[var(--theme-accent-primary)] hover:text-slate-950 text-[var(--theme-text-primary)] font-bold font-mono text-xs flex items-center justify-center transition-colors border border-[var(--theme-border-hairline)]"
                >
                  ↓ {c + 1}
                </button>
              ))}
            </div>

            <div className="w-full max-w-[min(88vw,440px)] aspect-square p-3 sm:p-4 bg-[var(--theme-board-casing)] rounded-3xl border-4 border-[var(--theme-border-hairline)] shadow-2xl flex flex-col justify-center items-center relative overflow-hidden">
              <div className="grid grid-cols-7 grid-rows-6 gap-2 sm:gap-2.5 w-full max-w-full aspect-[7/6] bg-[var(--theme-grid-bg)] p-2 sm:p-3 rounded-2xl relative">
                {c4Board.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="aspect-square w-full h-full relative rounded-full bg-[var(--theme-bg-canvas)] flex items-center justify-center shadow-inner overflow-hidden select-none"
                    >
                      {cell === 'Y' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div
                            className="w-full h-full rounded-full border-2 shadow-md"
                            style={{
                              backgroundColor: 'var(--theme-piece-player)',
                              borderColor: 'var(--theme-accent-primary)',
                            }}
                          />
                        </div>
                      )}
                      {cell === 'R' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div
                            className="w-full h-full rounded-full border-2 shadow-md"
                            style={{
                              backgroundColor: 'var(--theme-piece-opponent)',
                              borderColor: 'rgba(255,255,255,0.3)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Puzzle Fallback */}
        {challenge.puzzleType !== 'chess_mate' &&
          challenge.puzzleType !== 'ttt_fork' &&
          challenge.puzzleType !== 'c4_drop' && (
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-700 text-center max-w-md">
              <Crown className="w-12 h-12 text-amber-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-2">{challenge.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{challenge.condition}</p>
              <button
                onClick={() => handleChallengeSuccess('Tactical Solution', 'Solved daily objective condition!')}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Execute Winning Move
              </button>
            </div>
          )}
      </div>

      {/* Success Modal with Points, Badges, and Move Review */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-4 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
              <Trophy className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[var(--theme-text-primary)]">Daily Puzzle Solved!</h2>
              <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
                You completed <strong>{challenge.title}</strong>
              </p>
            </div>

            {/* Reward badges & points summary */}
            <div className="w-full bg-[var(--theme-bg-canvas)]/80 rounded-2xl p-4 border border-[var(--theme-border-hairline)] grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded-xl bg-[var(--theme-surface-card)]/60">
                <span className="text-[var(--theme-text-secondary)] text-[10px] uppercase font-bold block">
                  Points Earned
                </span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  +{earnedPoints} XP
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--theme-surface-card)]/60">
                <span className="text-[var(--theme-text-secondary)] text-[10px] uppercase font-bold block">
                  Daily Streak
                </span>
                <span className="text-xl font-extrabold text-orange-400 font-mono flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-current" />
                  {newStreak} Days
                </span>
              </div>
            </div>

            {/* Unlocked Badges */}
            {earnedBadges.length > 0 && (
              <div className="w-full text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Badge Unlocked!
                </span>
                <div className="flex flex-col gap-1.5">
                  {earnedBadges.map((b) => (
                    <Badge key={b.id} badge={b} size="sm" isUnlocked={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                onClick={onBack}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-transform active:scale-98"
              >
                Back to Daily Challenges Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChallengeView;
