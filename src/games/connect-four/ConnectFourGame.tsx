import React, { useState, useEffect, useCallback, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';

const ROWS = 6;
const COLS = 7;
type PlayerPiece = 'Y' | 'R' | null; // Y = Yellow/Cyan (Player), R = Red (AI)
type BoardState = PlayerPiece[][]; // 6 rows, 7 cols

function createEmptyBoard(): BoardState {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export const ConnectFourGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, playLoseSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const [board, setBoard] = useState<BoardState>(createEmptyBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [lastPlaced, setLastPlaced] = useState<[number, number] | null>(null);
  const [winningCoords, setWinningCoords] = useState<[number, number][] | null>(null);

  const recorder = useMoveRecorder<BoardState>({
    gameId: 'connect-four',
    gameName,
    initialBoard: createEmptyBoard(),
    onGameEnd: (result, moves) => {
      if (result.winner === 'player1') {
        playWinSound();
      } else if (result.winner === 'ai') {
        playLoseSound();
      }
      recordMatchResult({
        gameId: 'connect-four',
        gameName,
        result: result.winner === 'player1' ? 'win' : result.winner === 'ai' ? 'loss' : 'draw',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.playerName}: ${m.notation}`),
      });
    },
  });

  // Check 4-in-a-row
  const checkWinner = useCallback((b: BoardState): { winner: PlayerPiece | 'draw' | null; line?: [number, number][] } => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r][c + 1] && piece === b[r][c + 2] && piece === b[r][c + 3]) {
          return { winner: piece, line: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
        }
      }
    }
    // Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r + 1][c] && piece === b[r + 2][c] && piece === b[r + 3][c]) {
          return { winner: piece, line: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
        }
      }
    }
    // Diagonal down-right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r + 1][c + 1] && piece === b[r + 2][c + 2] && piece === b[r + 3][c + 3]) {
          return { winner: piece, line: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
        }
      }
    }
    // Diagonal down-left
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 3; c < COLS; c++) {
        const piece = b[r][c];
        if (piece && piece === b[r + 1][c - 1] && piece === b[r + 2][c - 2] && piece === b[r + 3][c - 3]) {
          return { winner: piece, line: [[r, c], [r + 1, c - 1], [r + 2, c - 2], [r + 3, c - 3]] };
        }
      }
    }

    // Check draw (top row full)
    const isFull = b[0].every((cell) => cell !== null);
    if (isFull) {
      return { winner: 'draw' };
    }

    return { winner: null };
  }, []);

  // Find lowest empty row in column
  const getLowestEmptyRow = (b: BoardState, col: number): number => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][col] === null) {
        return r;
      }
    }
    return -1;
  };

  // Smart AI move
  const getAiCol = useCallback((currentBoard: BoardState): number => {
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getLowestEmptyRow(currentBoard, c) !== -1) {
        validCols.push(c);
      }
    }
    if (validCols.length === 0) return -1;

    // 1. Can AI win in 1 move?
    for (const c of validCols) {
      const r = getLowestEmptyRow(currentBoard, c);
      const copy = currentBoard.map((row) => [...row]);
      copy[r][c] = 'R';
      if (checkWinner(copy).winner === 'R') {
        return c;
      }
    }

    // 2. Must AI block player from winning?
    for (const c of validCols) {
      const r = getLowestEmptyRow(currentBoard, c);
      const copy = currentBoard.map((row) => [...row]);
      copy[r][c] = 'Y';
      if (checkWinner(copy).winner === 'Y') {
        return c;
      }
    }

    // 3. Center column preference (col 3)
    if (validCols.includes(3) && Math.random() < 0.6) {
      return 3;
    }

    // 4. Random valid column
    return validCols[Math.floor(Math.random() * validCols.length)];
  }, [checkWinner]);

  // Execute AI move
  useEffect(() => {
    if (!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode) {
      const timer = setTimeout(() => {
        const col = getAiCol(board);
        if (col === -1) return;

        const row = getLowestEmptyRow(board, col);
        if (row === -1) return;

        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = 'R';
        setBoard(newBoard);
        setLastPlaced([row, col]);
        playMoveSound('place');

        const winResult = checkWinner(newBoard);
        if (winResult.line) {
          setWinningCoords(winResult.line);
        }

        const notation = `Col ${col + 1} (R${row + 1}C${col + 1})`;
        const desc = `AI dropped disc into Column ${col + 1}`;

        recorder.recordMove({
          player: 'ai',
          playerName: 'AI Opponent (Red)',
          playerType: 'ai',
          notation,
          action: 'Drop Disc',
          description: desc,
          boardSnapshot: newBoard,
          highlightCells: [{ row, col, type: 'placed' }],
        });

        if (winResult.winner) {
          recorder.finishGame({
            winner: winResult.winner === 'R' ? 'ai' : 'draw',
            winnerName: winResult.winner === 'R' ? 'AI Opponent' : undefined,
            reason:
              winResult.winner === 'R'
                ? 'AI connected four discs in a row!'
                : 'Grid is full. Game ended in a draw.',
          });
        } else {
          setIsPlayerTurn(true);
        }
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, recorder, getAiCol, checkWinner, playMoveSound]);

  // Handle player dropping disk
  const handleDropDisc = (col: number) => {
    if (recorder.isReviewMode || recorder.isGameOver || !isPlayerTurn) return;

    const row = getLowestEmptyRow(board, col);
    if (row === -1) return; // Column full

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = 'Y';
    setBoard(newBoard);
    setLastPlaced([row, col]);
    playMoveSound('place');

    const winResult = checkWinner(newBoard);
    if (winResult.line) {
      setWinningCoords(winResult.line);
    }

    const notation = `Col ${col + 1} (R${row + 1}C${col + 1})`;
    const desc = `You dropped disc into Column ${col + 1}`;

    recorder.recordMove({
      player: 'player1',
      playerName: 'You (Yellow)',
      playerType: 'human',
      notation,
      action: 'Drop Disc',
      description: desc,
      boardSnapshot: newBoard,
      highlightCells: [{ row, col, type: 'placed' }],
    });

    if (winResult.winner) {
      recorder.finishGame({
        winner: winResult.winner === 'Y' ? 'player1' : 'draw',
        winnerName: winResult.winner === 'Y' ? 'You' : undefined,
        reason:
          winResult.winner === 'Y'
            ? 'You connected four discs in a row!'
            : 'Grid is full. Game ended in a draw.',
      });
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleRestart = () => {
    const empty = createEmptyBoard();
    setBoard(empty);
    setIsPlayerTurn(true);
    setHoveredCol(null);
    setLastPlaced(null);
    setWinningCoords(null);
    recorder.resetGame(empty);
  };

  // Determine active board snapshot for replay vs live
  const displayBoard: BoardState = recorder.isReviewMode
    ? recorder.activeSnapshot || createEmptyBoard()
    : board;

  const activeHighlights = recorder.activeHighlights;

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Vertical Strategy"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage={isPlayerTurn ? 'Your turn to drop a disc' : 'AI is planning drop...'}
      isAiTurn={!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode}
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Column Drop Arrow Indicators */}
        {!recorder.isReviewMode && !recorder.isGameOver && isPlayerTurn && (
          <div className="grid grid-cols-7 gap-2 w-full max-w-sm px-3">
            {Array.from({ length: COLS }).map((_, c) => {
              const canDrop = getLowestEmptyRow(board, c) !== -1;
              const isHovered = hoveredCol === c;
              return (
                <button
                  key={c}
                  onClick={() => handleDropDisc(c)}
                  onMouseEnter={() => setHoveredCol(c)}
                  onMouseLeave={() => setHoveredCol(null)}
                  disabled={!canDrop}
                  className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                    canDrop
                      ? isHovered
                        ? 'bg-amber-400 text-slate-950 translate-y-1 shadow-md shadow-amber-400/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      : 'opacity-20 cursor-not-allowed bg-slate-900 text-slate-600'
                  }`}
                  title={`Drop disc in Column ${c + 1}`}
                >
                  <span className="text-xs font-bold font-mono">↓ {c + 1}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Connect Four Board - Strictly Square Container */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[min(88vw,440px)] aspect-square p-3 sm:p-4 rounded-3xl border-4 shadow-2xl flex flex-col justify-center items-center relative overflow-hidden transition-colors"
        >
          <div
            style={{
              backgroundColor: 'var(--theme-grid-bg, #020617)',
              borderColor: 'var(--theme-board-border, #1e293b)',
            }}
            className="grid grid-cols-7 grid-rows-6 gap-2 sm:gap-2.5 w-full max-w-full aspect-[7/6] p-2 sm:p-3 rounded-2xl relative border"
          >
            {displayBoard.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isReviewHighlighted = activeHighlights.some(
                  (h) => h.row === rIdx && h.col === cIdx
                );
                const isNewlyPlaced =
                  lastPlaced && lastPlaced[0] === rIdx && lastPlaced[1] === cIdx;
                const isWinningDisc = winningCoords?.some(
                  ([wr, wc]) => wr === rIdx && wc === cIdx
                );

                // Calculate drop offset distance so disc falls down from above board
                const dropDistance = -1 * (rIdx + 1) * 60 - 50;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => handleDropDisc(cIdx)}
                    style={{
                      backgroundColor: 'var(--theme-cell-dark, #0f172a)',
                    }}
                    className="aspect-square w-full h-full relative rounded-full flex items-center justify-center cursor-pointer overflow-hidden shadow-inner select-none border border-black/20"
                  >
                    {cell === 'Y' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          style={{
                            '--drop-offset': `${dropDistance}px`,
                            backgroundColor: 'var(--theme-piece-player, #06b6d4)',
                            borderColor: 'var(--theme-piece-player-border, #67e8f9)',
                          } as React.CSSProperties}
                          className={`w-full h-full rounded-full border-2 shadow-md flex items-center justify-center ${
                            isNewlyPlaced || (recorder.isReviewMode && isReviewHighlighted)
                              ? 'anim-disc-drop'
                              : ''
                          } ${isWinningDisc ? 'anim-win-glow ring-4 ring-amber-300' : ''} ${
                            isReviewHighlighted && !isWinningDisc ? 'ring-4 ring-cyan-400' : ''
                          }`}
                        >
                          <div className="w-1/2 h-1/2 rounded-full border border-white/30" />
                        </div>
                      </div>
                    )}
                    {cell === 'R' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          style={{
                            '--drop-offset': `${dropDistance}px`,
                            backgroundColor: 'var(--theme-piece-opponent, #f43f5e)',
                            borderColor: 'var(--theme-piece-opponent-border, #fda4af)',
                          } as React.CSSProperties}
                          className={`w-full h-full rounded-full border-2 shadow-md flex items-center justify-center ${
                            isNewlyPlaced || (recorder.isReviewMode && isReviewHighlighted)
                              ? 'anim-disc-drop'
                              : ''
                          } ${isWinningDisc ? 'anim-win-glow ring-4 ring-rose-300' : ''} ${
                            isReviewHighlighted && !isWinningDisc ? 'ring-4 ring-cyan-400' : ''
                          }`}
                        >
                          <div className="w-1/2 h-1/2 rounded-full border border-black/30" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Players Legend */}
        <div className="flex items-center justify-center gap-6 text-xs opacity-75">
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: 'var(--theme-piece-player, #06b6d4)',
                borderColor: 'var(--theme-piece-player-border, #67e8f9)',
              }}
              className="w-4 h-4 rounded-full border shadow-sm"
            />
            <span>You</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: 'var(--theme-piece-opponent, #f43f5e)',
                borderColor: 'var(--theme-piece-opponent-border, #fda4af)',
              }}
              className="w-4 h-4 rounded-full border shadow-sm"
            />
            <span>AI Opponent</span>
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default ConnectFourGame;
