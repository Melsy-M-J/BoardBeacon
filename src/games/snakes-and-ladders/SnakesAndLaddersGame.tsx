import React, { useState, useEffect, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Dices, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SLState {
  playerPos: number; // 1 to 100
  aiPos: number;     // 1 to 100
  lastRoll: number;
}

const LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

const SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

export const SnakesAndLaddersGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, playLoseSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const initialSL: SLState = { playerPos: 1, aiPos: 1, lastRoll: 0 };
  const [gameState, setGameState] = useState<SLState>(initialSL);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [rolling, setRolling] = useState<boolean>(false);
  const [lastMoveEvent, setLastMoveEvent] = useState<{
    who: 'player' | 'ai';
    type: 'hop' | 'ladder' | 'snake';
  } | null>(null);

  const recorder = useMoveRecorder<SLState>({
    gameId: 'snake-and-ladder',
    gameName,
    initialBoard: initialSL,
    onGameEnd: (result, moves) => {
      if (result.winner === 'player1') {
        playWinSound();
      } else {
        playLoseSound();
      }
      recordMatchResult({
        gameId: 'snake-and-ladder',
        gameName,
        result: result.winner === 'player1' ? 'win' : 'loss',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.playerName}: ${m.notation}`),
      });
    },
  });

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  // Handle Player Roll
  const handlePlayerRoll = () => {
    if (recorder.isReviewMode || recorder.isGameOver || !isPlayerTurn || rolling) return;

    setRolling(true);
    playMoveSound('jump');

    setTimeout(() => {
      const roll = rollDice();
      let nextPos = gameState.playerPos + roll;
      if (nextPos > 100) {
        nextPos = gameState.playerPos; // Exact roll needed to win
      }

      let action = `Rolled ${roll}`;
      let eventType: 'hop' | 'ladder' | 'snake' = 'hop';

      if (LADDERS[nextPos]) {
        nextPos = LADDERS[nextPos];
        action = `Ladder Jump! (+${roll})`;
        eventType = 'ladder';
      } else if (SNAKES[nextPos]) {
        nextPos = SNAKES[nextPos];
        action = `Snake Slide! (+${roll})`;
        eventType = 'snake';
      }

      const newState: SLState = {
        ...gameState,
        playerPos: nextPos,
        lastRoll: roll,
      };

      setGameState(newState);
      setLastMoveEvent({ who: 'player', type: eventType });
      setRolling(false);

      const notation = `Roll ${roll} -> Sq ${nextPos}`;
      const desc = `You rolled a ${roll} and landed on square ${nextPos}${
        eventType === 'ladder'
          ? ' (Climbed a ladder!)'
          : eventType === 'snake'
          ? ' (Slid down a snake!)'
          : ''
      }`;

      recorder.recordMove({
        player: 'player1',
        playerName: 'You (Blue)',
        playerType: 'human',
        notation,
        action,
        description: desc,
        boardSnapshot: newState,
        highlightCells: [{ index: nextPos, type: 'to' }],
      });

      if (nextPos === 100) {
        recorder.finishGame({
          winner: 'player1',
          winnerName: 'You',
          reason: 'You reached square 100 first!',
        });
      } else {
        setIsPlayerTurn(false);
      }
    }, 400);
  };

  // AI Turn
  useEffect(() => {
    if (!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode) {
      const timer = setTimeout(() => {
        const roll = rollDice();
        let nextPos = gameState.aiPos + roll;
        if (nextPos > 100) {
          nextPos = gameState.aiPos;
        }

        let action = `Rolled ${roll}`;
        let eventType: 'hop' | 'ladder' | 'snake' = 'hop';

        if (LADDERS[nextPos]) {
          nextPos = LADDERS[nextPos];
          action = `Ladder Jump! (+${roll})`;
          eventType = 'ladder';
        } else if (SNAKES[nextPos]) {
          nextPos = SNAKES[nextPos];
          action = `Snake Slide! (+${roll})`;
          eventType = 'snake';
        }

        const newState: SLState = {
          ...gameState,
          aiPos: nextPos,
          lastRoll: roll,
        };

        setGameState(newState);
        setLastMoveEvent({ who: 'ai', type: eventType });

        const notation = `Roll ${roll} -> Sq ${nextPos}`;
        const desc = `AI rolled a ${roll} and landed on square ${nextPos}${
          eventType === 'ladder'
            ? ' (Climbed a ladder!)'
            : eventType === 'snake'
            ? ' (Slid down a snake!)'
            : ''
        }`;

        recorder.recordMove({
          player: 'ai',
          playerName: 'AI Opponent (Red)',
          playerType: 'ai',
          notation,
          action,
          description: desc,
          boardSnapshot: newState,
          highlightCells: [{ index: nextPos, type: 'to' }],
        });

        if (nextPos === 100) {
          recorder.finishGame({
            winner: 'ai',
            winnerName: 'AI Opponent',
            reason: 'AI reached square 100 first!',
          });
        } else {
          setIsPlayerTurn(true);
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, recorder]);

  const handleRestart = () => {
    setGameState(initialSL);
    setIsPlayerTurn(true);
    setRolling(false);
    setLastMoveEvent(null);
    recorder.resetGame(initialSL);
  };

  const displayState: SLState = recorder.isReviewMode
    ? recorder.activeSnapshot || initialSL
    : gameState;

  // Build 10x10 grid with boustrophedon (bouncing) zigzag numbering (100 down to 1)
  const rows = [];
  for (let r = 9; r >= 0; r--) {
    const rowSquares = [];
    for (let c = 0; c < 10; c++) {
      const num = r % 2 === 1 ? r * 10 + (10 - c) : r * 10 + (c + 1);
      rowSquares.push(num);
    }
    rows.push(rowSquares);
  }

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Race to 100"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage={isPlayerTurn ? 'Roll the dice to advance!' : 'AI rolling dice...'}
      isAiTurn={!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode}
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Dice Controls */}
        {!recorder.isReviewMode && !recorder.isGameOver && (
          <div className="flex items-center gap-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-700 shadow-lg">
            <button
              onClick={handlePlayerRoll}
              disabled={!isPlayerTurn || rolling}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-40 transition-transform active:scale-95"
            >
              <Dices className={`w-5 h-5 ${rolling ? 'animate-spin' : ''}`} />
              <span>{rolling ? 'Rolling...' : 'Roll Dice'}</span>
            </button>

            {gameState.lastRoll > 0 && (
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Last Roll:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                  {gameState.lastRoll}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 10x10 Board - Strictly Square */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[min(88vw,440px)] aspect-square p-2 sm:p-3 rounded-3xl border shadow-2xl overflow-hidden flex items-center justify-center transition-colors"
        >
          <div
            style={{
              backgroundColor: 'var(--theme-grid-bg, #020617)',
            }}
            className="grid grid-cols-10 grid-rows-10 gap-1 p-1.5 sm:p-2 rounded-2xl w-full h-full aspect-square relative"
          >
            {rows.map((row) =>
              row.map((sq) => {
                const hasPlayer = displayState.playerPos === sq;
                const hasAi = displayState.aiPos === sq;
                const isLadderStart = LADDERS[sq] !== undefined;
                const isSnakeStart = SNAKES[sq] !== undefined;

                const isPlayerAnimated = hasPlayer && lastMoveEvent?.who === 'player';
                const isAiAnimated = hasAi && lastMoveEvent?.who === 'ai';

                const playerAnimClass = isPlayerAnimated
                  ? lastMoveEvent.type === 'ladder'
                    ? 'anim-climb-ladder'
                    : lastMoveEvent.type === 'snake'
                    ? 'anim-slide-snake'
                    : 'anim-pawn-hop'
                  : '';

                const aiAnimClass = isAiAnimated
                  ? lastMoveEvent.type === 'ladder'
                    ? 'anim-climb-ladder'
                    : lastMoveEvent.type === 'snake'
                    ? 'anim-slide-snake'
                    : 'anim-pawn-hop'
                  : '';

                return (
                  <div
                    key={sq}
                    style={{
                      backgroundColor:
                        sq % 2 === 0
                          ? 'var(--theme-cell-dark, #0f172a)'
                          : 'var(--theme-cell-light, #1e293b)',
                      borderColor: isLadderStart
                        ? 'rgba(16, 185, 129, 0.6)'
                        : isSnakeStart
                        ? 'rgba(244, 63, 94, 0.6)'
                        : 'var(--theme-border-hairline, rgba(255,255,255,0.08))',
                    }}
                    className={`aspect-square w-full h-full relative rounded-md sm:rounded-lg flex items-center justify-center text-[9px] sm:text-[11px] font-mono font-medium select-none overflow-hidden border ${
                      isLadderStart
                        ? 'bg-emerald-950/30'
                        : isSnakeStart
                        ? 'bg-rose-950/30'
                        : ''
                    }`}
                  >
                    <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] opacity-50 font-mono leading-none">
                      {sq}
                    </span>

                    {/* Ladder or Snake Indicator */}
                    {isLadderStart && (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400 opacity-80" />
                    )}
                    {isSnakeStart && (
                      <ArrowDownRight className="w-3 h-3 text-rose-400 opacity-80" />
                    )}

                    {/* Pawns */}
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5 z-10 pointer-events-none">
                      {hasPlayer && (
                        <div
                          style={{
                            backgroundColor: 'var(--theme-piece-player, #06b6d4)',
                            borderColor: 'var(--theme-piece-player-border, #67e8f9)',
                          }}
                          className={`w-3.5 h-3.5 rounded-full border shadow-md ${
                            playerAnimClass || 'animate-pulse'
                          }`}
                          title="You"
                        />
                      )}
                      {hasAi && (
                        <div
                          style={{
                            backgroundColor: 'var(--theme-piece-opponent, #f43f5e)',
                            borderColor: 'var(--theme-piece-opponent-border, #fda4af)',
                          }}
                          className={`w-3.5 h-3.5 rounded-full border shadow-md ${
                            aiAnimClass || 'animate-pulse'
                          }`}
                          title="AI"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>You (Sq {displayState.playerPos})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>AI (Sq {displayState.aiPos})</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Ladder Climb</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Snake Slide</span>
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default SnakesAndLaddersGame;
