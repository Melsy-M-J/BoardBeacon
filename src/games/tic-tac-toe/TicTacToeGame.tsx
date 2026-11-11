import React, { useState, useEffect, useCallback, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';

type BoardState = (string | null)[]; // 9 cells

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const TicTacToeGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, playLoseSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const initialBoard: BoardState = Array(9).fill(null);

  // Live board state
  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true); // Player = 'X', AI = 'O'
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Move recorder base hook
  const recorder = useMoveRecorder<BoardState>({
    gameId: 'tic-tac-toe',
    gameName,
    initialBoard,
    onGameEnd: (result, moves) => {
      if (result.winner === 'player1') {
        playWinSound();
      } else if (result.winner === 'ai') {
        playLoseSound();
      }
      recordMatchResult({
        gameId: 'tic-tac-toe',
        gameName,
        result: result.winner === 'player1' ? 'win' : result.winner === 'ai' ? 'loss' : 'draw',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.playerName}: ${m.notation}`),
      });
    },
  });

  const checkWinner = (b: BoardState): { winner: string | null; line: number[] | null } => {
    for (const [a, c, d] of WINNING_COMBOS) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line: [a, c, d] };
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { winner: 'draw', line: null };
    }
    return { winner: null, line: null };
  };

  // Convert index to readable coordinate notation (e.g. "Row 1, Col 2")
  const getCoordNotation = (index: number): string => {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    return `R${row}C${col}`;
  };

  const getCoordDescription = (index: number, playerSymbol: string): string => {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const posName =
      index === 4
        ? 'Center'
        : [0, 2, 6, 8].includes(index)
        ? 'Corner'
        : 'Edge';
    return `Placed ${playerSymbol} in ${posName} at Row ${row}, Column ${col}`;
  };

  // AI Move calculation
  const getAiMove = useCallback(
    (currentBoard: BoardState): number => {
      const available = currentBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);

      if (available.length === 0) return -1;

      // Check if AI can win immediately
      for (const idx of available) {
        const copy = [...currentBoard];
        copy[idx] = 'O';
        if (checkWinner(copy).winner === 'O') return idx;
      }

      // Check if AI must block human win
      for (const idx of available) {
        const copy = [...currentBoard];
        copy[idx] = 'X';
        if (checkWinner(copy).winner === 'X') return idx;
      }

      if (difficulty === 'hard') {
        // Take center if available
        if (currentBoard[4] === null) return 4;
        // Take corners
        const corners = [0, 2, 6, 8].filter((c) => currentBoard[c] === null);
        if (corners.length > 0) {
          return corners[Math.floor(Math.random() * corners.length)];
        }
      }

      // Random available
      return available[Math.floor(Math.random() * available.length)];
    },
    [difficulty]
  );

  // Trigger AI move when it's AI turn
  useEffect(() => {
    if (!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode) {
      const timer = setTimeout(() => {
        const aiIndex = getAiMove(board);
        if (aiIndex !== -1) {
          const newBoard = [...board];
          newBoard[aiIndex] = 'O';
          setBoard(newBoard);
          setLastMoveIndex(aiIndex);
          playMoveSound('place');

          const winInfo = checkWinner(newBoard);
          if (winInfo.line) {
            setWinningLine(winInfo.line);
          }

          const notation = getCoordNotation(aiIndex);
          const desc = getCoordDescription(aiIndex, 'O');

          recorder.recordMove({
            player: 'ai',
            playerName: 'AI Opponent (O)',
            playerType: 'ai',
            notation,
            action: 'Place O',
            description: desc,
            boardSnapshot: newBoard,
            highlightCells: [{ index: aiIndex, type: 'placed' }],
          });

          if (winInfo.winner) {
            recorder.finishGame({
              winner: winInfo.winner === 'O' ? 'ai' : 'draw',
              winnerName: winInfo.winner === 'O' ? 'AI Opponent' : undefined,
              reason:
                winInfo.winner === 'O'
                  ? 'AI aligned 3 in a row!'
                  : 'Board full. Game ended in a draw.',
            });
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, recorder, getAiMove, playMoveSound]);

  // Handle player cell click
  const handleCellClick = (index: number) => {
    if (
      recorder.isReviewMode ||
      recorder.isGameOver ||
      !isPlayerTurn ||
      board[index] !== null
    ) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setLastMoveIndex(index);
    playMoveSound('place');

    const winInfo = checkWinner(newBoard);
    if (winInfo.line) {
      setWinningLine(winInfo.line);
    }

    const notation = getCoordNotation(index);
    const desc = getCoordDescription(index, 'X');

    recorder.recordMove({
      player: 'player1',
      playerName: 'You (X)',
      playerType: 'human',
      notation,
      action: 'Place X',
      description: desc,
      boardSnapshot: newBoard,
      highlightCells: [{ index, type: 'placed' }],
    });

    if (winInfo.winner) {
      recorder.finishGame({
        winner: winInfo.winner === 'X' ? 'player1' : 'draw',
        winnerName: winInfo.winner === 'X' ? 'You' : undefined,
        reason:
          winInfo.winner === 'X'
            ? 'You aligned 3 marks in a row!'
            : 'Board full. Game ended in a draw.',
      });
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleRestart = () => {
    const emptyBoard: BoardState = Array(9).fill(null);
    setBoard(emptyBoard);
    setIsPlayerTurn(true);
    setLastMoveIndex(null);
    setWinningLine(null);
    recorder.resetGame(emptyBoard);
  };

  // Determine what board to display
  const displayBoard: BoardState = recorder.isReviewMode
    ? recorder.activeSnapshot || initialBoard
    : board;

  const activeHighlightedIndices = recorder.activeHighlights
    .map((h) => h.index)
    .filter((idx): idx is number => idx !== undefined);

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Classic Grid Game"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage={isPlayerTurn ? 'Your turn (X)' : 'AI turn (O)'}
      isAiTurn={!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Difficulty Toggle (when not in review) */}
        {!recorder.isReviewMode && !recorder.isGameOver && (
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 px-2 font-medium">Difficulty:</span>
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  difficulty === diff
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        )}

        {/* 3x3 Board: Guaranteed Strict Square Size with Identical Square Cells */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[340px] sm:max-w-[380px] aspect-square p-3 sm:p-4 rounded-3xl border shadow-2xl flex items-center justify-center transition-colors"
        >
          <div className="grid grid-cols-3 grid-rows-3 gap-2.5 sm:gap-3 w-full h-full aspect-square">
            {displayBoard.map((cellValue, idx) => {
              const isReviewHighlighted = activeHighlightedIndices.includes(idx);
              const isNewlyPlaced = lastMoveIndex === idx;
              const isWinningCell = winningLine?.includes(idx);
              const isCellEmpty = cellValue === null;
              const canClick =
                !recorder.isReviewMode &&
                !recorder.isGameOver &&
                isPlayerTurn &&
                isCellEmpty;

              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={!canClick}
                  style={{
                    backgroundColor: 'var(--theme-cell-light, #1e293b)',
                    borderColor: 'var(--theme-border-hairline, #1e293b)',
                  }}
                  className={`aspect-square w-full h-full relative rounded-2xl flex items-center justify-center select-none overflow-hidden transition-all duration-200 border ${
                    isWinningCell
                      ? 'anim-win-glow ring-4 ring-amber-400'
                      : isReviewHighlighted
                      ? 'anim-highlight-pulse ring-4 ring-cyan-400 shadow-lg'
                      : 'hover:brightness-110'
                  } ${
                    canClick
                      ? 'cursor-pointer hover:scale-[1.03] active:scale-95'
                      : 'cursor-default'
                  }`}
                >
                  {/* Coordinate micro-tag in corner for review analysis */}
                  <span className="absolute top-1.5 left-2 text-[9px] font-mono opacity-50 z-10 pointer-events-none">
                    {getCoordNotation(idx)}
                  </span>

                  {cellValue === 'X' && (
                    <span
                      style={{ color: 'var(--theme-piece-player, #06b6d4)' }}
                      className={`absolute inset-0 flex items-center justify-center font-extrabold text-4xl sm:text-5xl leading-none select-none drop-shadow-[0_0_12px_var(--theme-accent-glow)] ${
                        isNewlyPlaced || (recorder.isReviewMode && isReviewHighlighted)
                          ? 'anim-mark-x'
                          : ''
                      }`}
                    >
                      X
                    </span>
                  )}
                  {cellValue === 'O' && (
                    <span
                      style={{ color: 'var(--theme-piece-opponent, #f43f5e)' }}
                      className={`absolute inset-0 flex items-center justify-center font-extrabold text-4xl sm:text-5xl leading-none select-none drop-shadow-[0_0_12px_var(--theme-accent-glow)] ${
                        isNewlyPlaced || (recorder.isReviewMode && isReviewHighlighted)
                          ? 'anim-mark-o'
                          : ''
                      }`}
                    >
                      O
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold flex items-center justify-center text-[10px]">
              X
            </span>
            <span>You</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold flex items-center justify-center text-[10px]">
              O
            </span>
            <span>AI Opponent</span>
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default TicTacToeGame;
