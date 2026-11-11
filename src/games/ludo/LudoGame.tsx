import React, { useState, useEffect, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Dices } from 'lucide-react';

interface LudoState {
  playerTokens: number[]; // 4 tokens, track index 0..56
  aiTokens: number[];     // 4 tokens
  lastRoll: number;
}

const initialLudo: LudoState = {
  playerTokens: [0, 0, 0, 0],
  aiTokens: [0, 0, 0, 0],
  lastRoll: 0,
};

export const LudoGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, playLoseSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const [gameState, setGameState] = useState<LudoState>(initialLudo);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [rolling, setRolling] = useState<boolean>(false);

  const recorder = useMoveRecorder<LudoState>({
    gameId: 'ludo',
    gameName,
    initialBoard: initialLudo,
    onGameEnd: (result, moves) => {
      if (result.winner === 'player1') {
        playWinSound();
      } else {
        playLoseSound();
      }
      recordMatchResult({
        gameId: 'ludo',
        gameName,
        result: result.winner === 'player1' ? 'win' : 'loss',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.playerName}: ${m.notation}`),
      });
    },
  });

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const handlePlayerRoll = () => {
    if (recorder.isReviewMode || recorder.isGameOver || !isPlayerTurn || rolling) return;

    setRolling(true);
    playMoveSound('jump');

    setTimeout(() => {
      const roll = rollDice();
      // Move first available token that isn't finished
      const tokenIdx = gameState.playerTokens.findIndex((p) => p < 56);
      if (tokenIdx === -1) return;

      const newTokens = [...gameState.playerTokens];
      newTokens[tokenIdx] = Math.min(56, newTokens[tokenIdx] + roll);

      const newState: LudoState = {
        ...gameState,
        playerTokens: newTokens,
        lastRoll: roll,
      };

      setGameState(newState);
      setRolling(false);

      const notation = `Token #${tokenIdx + 1} +${roll} -> Pos ${newTokens[tokenIdx]}`;
      const desc = `You rolled ${roll} and advanced Token #${tokenIdx + 1} to position ${newTokens[tokenIdx]}`;

      recorder.recordMove({
        player: 'player1',
        playerName: 'You (Blue)',
        playerType: 'human',
        notation,
        action: `Advance Token #${tokenIdx + 1}`,
        description: desc,
        boardSnapshot: newState,
        highlightCells: [{ index: newTokens[tokenIdx], type: 'to' }],
      });

      if (newTokens.every((p) => p >= 56)) {
        recorder.finishGame({
          winner: 'player1',
          winnerName: 'You',
          reason: 'All 4 tokens reached home!',
        });
      } else {
        setIsPlayerTurn(false);
      }
    }, 400);
  };

  useEffect(() => {
    if (!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode) {
      const timer = setTimeout(() => {
        const roll = rollDice();
        const tokenIdx = gameState.aiTokens.findIndex((p) => p < 56);
        if (tokenIdx === -1) return;

        const newTokens = [...gameState.aiTokens];
        newTokens[tokenIdx] = Math.min(56, newTokens[tokenIdx] + roll);

        const newState: LudoState = {
          ...gameState,
          aiTokens: newTokens,
          lastRoll: roll,
        };

        setGameState(newState);

        const notation = `AI Token #${tokenIdx + 1} +${roll} -> Pos ${newTokens[tokenIdx]}`;
        const desc = `AI rolled ${roll} and advanced Token #${tokenIdx + 1} to position ${newTokens[tokenIdx]}`;

        recorder.recordMove({
          player: 'ai',
          playerName: 'AI Opponent (Red)',
          playerType: 'ai',
          notation,
          action: `Advance Token #${tokenIdx + 1}`,
          description: desc,
          boardSnapshot: newState,
          highlightCells: [{ index: newTokens[tokenIdx], type: 'to' }],
        });

        if (newTokens.every((p) => p >= 56)) {
          recorder.finishGame({
            winner: 'ai',
            winnerName: 'AI Opponent',
            reason: 'All 4 AI tokens reached home!',
          });
        } else {
          setIsPlayerTurn(true);
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, recorder]);

  const handleRestart = () => {
    setGameState(initialLudo);
    setIsPlayerTurn(true);
    setRolling(false);
    recorder.resetGame(initialLudo);
  };

  const displayState: LudoState = recorder.isReviewMode
    ? recorder.activeSnapshot || initialLudo
    : gameState;

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Race Strategy"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage={isPlayerTurn ? 'Roll dice to move tokens towards home' : 'AI is rolling...'}
      isAiTurn={!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode}
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Dice Controller */}
        {!recorder.isReviewMode && !recorder.isGameOver && (
          <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-700 shadow-lg">
            <button
              onClick={handlePlayerRoll}
              disabled={!isPlayerTurn || rolling}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-40"
            >
              <Dices className={`w-5 h-5 ${rolling ? 'animate-spin' : ''}`} />
              <span>{rolling ? 'Rolling...' : 'Roll Dice'}</span>
            </button>
            {gameState.lastRoll > 0 && (
              <span className="text-xs text-slate-300 font-mono">
                Rolled: <strong className="text-cyan-400 text-sm">{gameState.lastRoll}</strong>
              </span>
            )}
          </div>
        )}

        {/* Ludo Board - Strictly Square Container & Cells */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[min(88vw,440px)] aspect-square p-2 sm:p-3 rounded-3xl border shadow-2xl overflow-hidden flex items-center justify-center transition-colors"
        >
          <div
            style={{ backgroundColor: 'var(--theme-grid-bg, #020617)' }}
            className="grid grid-cols-9 grid-rows-9 gap-1 p-1.5 sm:p-2 rounded-2xl w-full h-full aspect-square relative"
          >
            {Array.from({ length: 9 }).map((_, r) =>
              Array.from({ length: 9 }).map((_, c) => {
                // Zone determination
                const isPlayerBase = r <= 2 && c <= 2;
                const isAiBase = r <= 2 && c >= 6;
                const isGreenBase = r >= 6 && c <= 2;
                const isYellowBase = r >= 6 && c >= 6;
                const isCenterHome = r >= 3 && r <= 5 && c >= 3 && c <= 5;
                const isCenterCore = r === 4 && c === 4;

                // Path indices mapping (24 perimeter cells)
                let cellTrackIndex: number | null = null;
                if (r === 3 && c === 0) cellTrackIndex = 0;
                else if (r === 3 && c === 1) cellTrackIndex = 1;
                else if (r === 3 && c === 2) cellTrackIndex = 2;
                else if (r === 2 && c === 3) cellTrackIndex = 3;
                else if (r === 1 && c === 3) cellTrackIndex = 4;
                else if (r === 0 && c === 3) cellTrackIndex = 5;
                else if (r === 0 && c === 4) cellTrackIndex = 6;
                else if (r === 0 && c === 5) cellTrackIndex = 7;
                else if (r === 1 && c === 5) cellTrackIndex = 8;
                else if (r === 2 && c === 5) cellTrackIndex = 9;
                else if (r === 3 && c === 6) cellTrackIndex = 10;
                else if (r === 3 && c === 7) cellTrackIndex = 11;
                else if (r === 3 && c === 8) cellTrackIndex = 12;
                else if (r === 4 && c === 8) cellTrackIndex = 13;
                else if (r === 5 && c === 8) cellTrackIndex = 14;
                else if (r === 5 && c === 7) cellTrackIndex = 15;
                else if (r === 5 && c === 6) cellTrackIndex = 16;
                else if (r === 6 && c === 5) cellTrackIndex = 17;
                else if (r === 7 && c === 5) cellTrackIndex = 18;
                else if (r === 8 && c === 5) cellTrackIndex = 19;
                else if (r === 8 && c === 4) cellTrackIndex = 20;
                else if (r === 8 && c === 3) cellTrackIndex = 21;
                else if (r === 7 && c === 3) cellTrackIndex = 22;
                else if (r === 6 && c === 3) cellTrackIndex = 23;
                else if (r === 5 && c === 2) cellTrackIndex = 24;
                else if (r === 5 && c === 1) cellTrackIndex = 25;
                else if (r === 5 && c === 0) cellTrackIndex = 26;
                else if (r === 4 && c === 0) cellTrackIndex = 27;

                // Check tokens present
                const playerTokensHere = cellTrackIndex !== null
                  ? displayState.playerTokens.filter((pos) => (pos % 28) === cellTrackIndex).length
                  : 0;
                const aiTokensHere = cellTrackIndex !== null
                  ? displayState.aiTokens.filter((pos) => ((pos + 14) % 28) === cellTrackIndex).length
                  : 0;

                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      backgroundColor: isPlayerBase
                        ? 'rgba(6, 182, 212, 0.2)'
                        : isAiBase
                        ? 'rgba(244, 63, 94, 0.2)'
                        : isGreenBase
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isYellowBase
                        ? 'rgba(234, 179, 8, 0.15)'
                        : isCenterCore
                        ? 'var(--theme-accent-primary, #06b6d4)'
                        : isCenterHome
                        ? 'var(--theme-cell-light, #1e293b)'
                        : 'var(--theme-cell-dark, #0f172a)',
                      borderColor: 'var(--theme-border-hairline, rgba(255,255,255,0.1))',
                    }}
                    className="aspect-square w-full h-full relative rounded-md flex items-center justify-center select-none overflow-hidden border"
                  >
                    {isCenterCore && (
                      <span className="text-[10px] font-black uppercase text-slate-950">HOME</span>
                    )}

                    {isPlayerBase && r === 1 && c === 1 && (
                      <span className="text-[9px] font-bold font-mono opacity-80">YOU</span>
                    )}

                    {isAiBase && r === 1 && c === 7 && (
                      <span className="text-[9px] font-bold font-mono opacity-80">AI</span>
                    )}

                    {/* Tokens inside cell */}
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none">
                      {playerTokensHere > 0 && (
                        <div
                          style={{
                            backgroundColor: 'var(--theme-piece-player, #06b6d4)',
                            borderColor: 'var(--theme-piece-player-border, #67e8f9)',
                          }}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border shadow-md flex items-center justify-center text-[8px] font-bold text-white leading-none"
                          title="Your Token"
                        >
                          {playerTokensHere > 1 ? playerTokensHere : '●'}
                        </div>
                      )}
                      {aiTokensHere > 0 && (
                        <div
                          style={{
                            backgroundColor: 'var(--theme-piece-opponent, #f43f5e)',
                            borderColor: 'var(--theme-piece-opponent-border, #fda4af)',
                          }}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border shadow-md flex items-center justify-center text-[8px] font-bold text-white leading-none"
                          title="AI Token"
                        >
                          {aiTokensHere > 1 ? aiTokensHere : '●'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tokens Status Bar */}
        <div className="w-full max-w-[min(88vw,440px)] grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-300">You (Blue)</span>
            <div className="flex gap-1">
              {displayState.playerTokens.map((p, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    p >= 56
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {p >= 56 ? '✓' : p}
                </span>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-300">AI (Red)</span>
            <div className="flex gap-1">
              {displayState.aiTokens.map((p, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    p >= 56
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {p >= 56 ? '✓' : p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default LudoGame;
