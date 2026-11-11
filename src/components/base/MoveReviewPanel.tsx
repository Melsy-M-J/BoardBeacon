import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  List,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  Bot,
  User as UserIcon,
  X,
} from 'lucide-react';
import { MoveRecorderControls, PlaybackSpeed } from '../../types/recorder';

interface MoveReviewPanelProps {
  recorder: MoveRecorderControls<any>;
  onExitReview?: () => void;
  accentColor?: string;
}

export const MoveReviewPanel: React.FC<MoveReviewPanelProps> = ({
  recorder,
  onExitReview,
  accentColor = '#64ffda',
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    moves,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    activeMove,
    isAtStart,
    isAtEnd,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLast,
    goToStep,
    togglePlay,
    setSpeed,
    copyTranscriptToClipboard,
  } = recorder;

  const totalMoves = moves.length;
  // Step index -1 is "Start / Initial Board" (Step 0 in human terms)
  const displayStep = currentStepIndex + 1; // 0 for initial, 1..totalMoves

  const handleCopy = async () => {
    const success = await copyTranscriptToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const speedOptions: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 transition-all animate-slide-in-up">
      {/* Top Bar of Review: Title, Step Counter & Quick Actions */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide flex items-center gap-1.5 uppercase">
            <span>Move History Review</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono border border-cyan-500/30">
              {displayStep === 0 ? 'Starting Board' : `Move ${displayStep} of ${totalMoves}`}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Transcript toggle */}
          <button
            onClick={() => setShowFullTranscript(!showFullTranscript)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1.5 transition-colors border ${
              showFullTranscript
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750'
            }`}
            title="Toggle full move transcript table"
          >
            <List className="w-3.5 h-3.5" />
            <span>{showFullTranscript ? 'Hide Log' : 'Move Log'}</span>
          </button>

          {/* Copy match transcript */}
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            title="Copy entire game move transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Exit review button */}
          {onExitReview && (
            <button
              onClick={onExitReview}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-1"
              title="Close review panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Move Highlight Card */}
      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between gap-4">
        {displayStep === 0 ? (
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Initial starting position (no moves played yet).</span>
          </div>
        ) : activeMove ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                activeMove.playerType === 'ai'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {activeMove.playerType === 'ai' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm truncate">
                  {activeMove.playerName}
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {activeMove.notation}
                </span>
                {activeMove.action && activeMove.action !== 'Move' && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeMove.action}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {activeMove.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Select a move to inspect details.</div>
        )}

        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-slate-500 font-mono">
            {displayStep} / {totalMoves}
          </div>
        </div>
      </div>

      {/* Interactive Timeline Scrubber Slider */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono px-0.5">
          <span>Start</span>
          <span>Timeline ({totalMoves} moves)</span>
          <span>End</span>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min={-1}
            max={totalMoves - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
        </div>
      </div>

      {/* Playback & VCR Navigation Toolbar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Navigation buttons: First, Prev, Play, Next, Last */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={goToFirst}
            disabled={isAtStart}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="First Move (Initial Board)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={goToPrevious}
            disabled={isAtStart}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Move (Step Back)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={totalMoves === 0}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
            title={isPlaying ? 'Pause Replay' : 'Autoplay Replay'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="text-xs hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="text-xs hidden sm:inline">Play</span>
              </>
            )}
          </button>

          <button
            onClick={goToNext}
            disabled={isAtEnd}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Move (Step Forward)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={goToLast}
            disabled={isAtEnd}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Last Move (Final Position)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:block" />
          {speedOptions.map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                playbackSpeed === spd
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Move Transcript Table */}
      {showFullTranscript && (
        <div className="mt-2 pt-3 border-t border-slate-800 flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Move Sequence (Click to jump)</span>
            <span className="text-[11px] text-slate-500 font-normal">
              {totalMoves} moves total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {/* Start button */}
            <button
              onClick={() => goToStep(-1)}
              className={`px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center justify-between border transition-all ${
                currentStepIndex === -1
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-medium'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="font-mono text-slate-500">00</span>
              <span>Initial Setup</span>
              <span className="text-[10px] text-slate-500">Board Init</span>
            </button>

            {moves.map((move, idx) => {
              const isSelected = currentStepIndex === idx;
              return (
                <button
                  key={move.id}
                  onClick={() => goToStep(idx)}
                  className={`px-2.5 py-1.5 text-left text-xs rounded-lg flex items-center justify-between border transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold ring-1 ring-cyan-400/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[11px] text-slate-500 w-5">
                      #{move.stepNumber}
                    </span>
                    <span
                      className={`text-[11px] px-1 rounded ${
                        move.playerType === 'ai'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {move.playerType === 'ai' ? 'AI' : 'P1'}
                    </span>
                    <span className="truncate">{move.notation}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono ml-1 flex-shrink-0">
                    {move.action}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveReviewPanel;
