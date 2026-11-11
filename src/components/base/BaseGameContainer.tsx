import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  History,
  Trophy,
  Award,
  Sparkles,
  Bot,
  User as UserIcon,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MoveRecorderControls } from '../../types/recorder';
import MoveReviewPanel from './MoveReviewPanel';

interface BaseGameContainerProps {
  gameName: string;
  gameCategory?: string;
  onBackToLobby: () => void;
  recorder: MoveRecorderControls<any>;
  onRestartGame: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  statusMessage?: string;
  isAiTurn?: boolean;
  children: React.ReactNode;
}

export const BaseGameContainer: React.FC<BaseGameContainerProps> = ({
  gameName,
  gameCategory = 'Classic Game',
  onBackToLobby,
  recorder,
  onRestartGame,
  soundEnabled = true,
  onToggleSound,
  statusMessage,
  isAiTurn = false,
  children,
}) => {
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [showLiveMoveTicker, setShowLiveMoveTicker] = useState(true);

  const {
    moves,
    isGameOver,
    gameResult,
    isReviewMode,
    currentStepIndex,
    startReview,
    exitReview,
    copyTranscriptToClipboard,
  } = recorder;

  // Trigger celebration and finish modal when game ends
  useEffect(() => {
    if (isGameOver && gameResult) {
      setShowFinishedModal(true);
      if (gameResult.winner === 'player1' || gameResult.winnerName?.toLowerCase().includes('you')) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } else {
      setShowFinishedModal(false);
    }
  }, [isGameOver, gameResult]);

  const handleStartReviewFromModal = () => {
    setShowFinishedModal(false);
    startReview();
  };

  const handleCopyLog = async () => {
    const success = await copyTranscriptToClipboard();
    if (success) {
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 2000);
    }
  };

  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Top Header Bar */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface-card, #0f172a)',
          borderColor: 'var(--theme-border-hairline, #1e293b)',
        }}
        className="w-full backdrop-blur-md border rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 flex-wrap transition-colors"
      >
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Return to Game Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {gameName}
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {gameCategory}
              </span>
            </div>
            {/* Dynamic Status / Turn message */}
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              {isReviewMode ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <History className="w-3.5 h-3.5" />
                  Reviewing Move #{currentStepIndex + 1} of {moves.length}
                </span>
              ) : isGameOver ? (
                <span className="text-emerald-400 font-medium">Game Finished</span>
              ) : isAiTurn ? (
                <span className="text-rose-400 flex items-center gap-1 animate-pulse">
                  <Bot className="w-3.5 h-3.5" /> AI is thinking...
                </span>
              ) : (
                <span className="text-slate-300">{statusMessage || 'Your Turn'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Review Button, Move Count Badge, Sound & Restart */}
        <div className="flex items-center gap-2">
          {/* Review Game Button */}
          {moves.length > 0 && (
            <button
              onClick={() => {
                if (isReviewMode) {
                  exitReview();
                } else {
                  startReview();
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isReviewMode
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold'
                  : 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/40'
              }`}
              title={isReviewMode ? 'Exit Review Mode' : 'Review Move History'}
            >
              <History className="w-3.5 h-3.5" />
              <span>{isReviewMode ? 'Exit Review' : 'Review Moves'}</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900/70 border border-slate-700">
                {moves.length}
              </span>
            </button>
          )}

          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-slate-800 text-cyan-400 border-slate-700 hover:bg-slate-750'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Restart Game Button */}
          <button
            onClick={onRestartGame}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Replay Mode Floating Indicator Badge */}
      {isReviewMode && (
        <div className="w-full max-w-xl bg-amber-500/15 border border-amber-500/40 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-amber-200 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold uppercase tracking-wider text-amber-300">
              Interactive Replay Mode Active
            </span>
            <span className="text-amber-400/80">
              Board shows snapshot at step {currentStepIndex + 1}
            </span>
          </div>
          <button
            onClick={exitReview}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform active:scale-95 text-[11px]"
          >
            Exit Replay
          </button>
        </div>
      )}

      {/* Main Game Stage / Board Area */}
      <div className="w-full flex flex-col items-center justify-center relative">
        {children}
      </div>

      {/* Review Mode Panel (Docked at bottom during Review) */}
      {isReviewMode ? (
        <div className="w-full max-w-2xl mt-2">
          <MoveReviewPanel recorder={recorder} onExitReview={exitReview} />
        </div>
      ) : (
        /* Live Game Recent Move Ticker (during gameplay) */
        moves.length > 0 &&
        !isGameOver && (
          <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Move #{moves.length}
              </span>
              {lastMove && (
                <span className="truncate">
                  <strong className="text-slate-200">{lastMove.playerName}</strong>: {lastMove.notation} ({lastMove.description})
                </span>
              )}
            </div>
            <button
              onClick={() => startReview(moves.length - 1)}
              className="flex-shrink-0 text-cyan-400 hover:text-cyan-300 text-[11px] font-medium ml-2 underline underline-offset-2"
            >
              Review match so far
            </button>
          </div>
        )
      )}

      {/* Game Finished Modal */}
      {showFinishedModal && gameResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--theme-surface-card)] border border-[var(--theme-border-hairline)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-4 animate-scale-in">
            {/* Header Icon */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                gameResult.winner === 'player1' || gameResult.winnerName?.toLowerCase().includes('you')
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : gameResult.winner === 'draw'
                  ? 'bg-slate-700/30 text-slate-300 border border-slate-600'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {gameResult.winner === 'player1' || gameResult.winnerName?.toLowerCase().includes('you') ? (
                <Trophy className="w-9 h-9" />
              ) : gameResult.winner === 'draw' ? (
                <Award className="w-9 h-9" />
              ) : (
                <Bot className="w-9 h-9" />
              )}
            </div>

            {/* Title & Reason */}
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--theme-text-primary)]">
                {gameResult.winner === 'player1' || gameResult.winnerName?.toLowerCase().includes('you')
                  ? 'Victory!'
                  : gameResult.winner === 'draw'
                  ? 'Game Drawn!'
                  : 'Game Over!'}
              </h2>
              <p className="text-sm text-[var(--theme-accent-primary)] font-medium mt-1">
                {gameResult.winnerName || (gameResult.winner === 'player1' ? 'You won' : 'AI won')}
              </p>
              <p className="text-xs text-[var(--theme-text-secondary)] mt-0.5">{gameResult.reason}</p>
            </div>

            {/* Match Stats Summary */}
            <div className="w-full bg-[var(--theme-bg-canvas)]/80 rounded-2xl p-3 border border-[var(--theme-border-hairline)] grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[var(--theme-surface-card)]/60">
                <span className="text-[var(--theme-text-secondary)] text-[10px] uppercase font-semibold block">
                  Total Moves
                </span>
                <span className="text-base font-bold text-[var(--theme-text-primary)] font-mono">
                  {moves.length}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[var(--theme-surface-card)]/60">
                <span className="text-[var(--theme-text-secondary)] text-[10px] uppercase font-semibold block">
                  Match Duration
                </span>
                <span className="text-base font-bold text-[var(--theme-text-primary)] font-mono">
                  {gameResult.durationSeconds}s
                </span>
              </div>
            </div>

            {/* Action Buttons: Swapped CSS between Return to Game Lobby (Primary) and Review Moves (Subtle Link) */}
            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowFinishedModal(false);
                  onBackToLobby();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-98 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Game Lobby</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowFinishedModal(false);
                    onRestartGame();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[var(--theme-bg-canvas)]/80 hover:bg-[var(--theme-bg-canvas)] text-[var(--theme-text-primary)] font-semibold text-xs border border-[var(--theme-border-hairline)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={handleCopyLog}
                  className="py-2.5 px-3 rounded-xl bg-[var(--theme-bg-canvas)]/80 hover:bg-[var(--theme-bg-canvas)] text-[var(--theme-text-primary)] font-semibold text-xs border border-[var(--theme-border-hairline)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLog ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Log</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleStartReviewFromModal}
                className="text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-primary)] transition-colors pt-1 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>Review Moves Step-by-Step</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseGameContainer;
