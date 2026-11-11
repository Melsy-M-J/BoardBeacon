import React, { useState, useEffect, useCallback, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Crown } from 'lucide-react';

interface CheckerPiece {
  player: 'red' | 'black'; // red = Human, black = AI
  isKing: boolean;
}

type CheckersBoard = (CheckerPiece | null)[][]; // 8x8

function createInitialCheckersBoard(): CheckersBoard {
  const board: CheckersBoard = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) {
          board[r][c] = { player: 'black', isKing: false };
        } else if (r > 4) {
          board[r][c] = { player: 'red', isKing: false };
        }
      }
    }
  }
  return board;
}

interface MoveOption {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  isJump: boolean;
  jumpedR?: number;
  jumpedC?: number;
}

interface LastMoveAnimation {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  isJump: boolean;
  crowned: boolean;
}

export const CheckersGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, playLoseSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const [board, setBoard] = useState<CheckersBoard>(createInitialCheckersBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true); // Red = human turn
  const [lastMoveAnim, setLastMoveAnim] = useState<LastMoveAnimation | null>(null);

  const recorder = useMoveRecorder<CheckersBoard>({
    gameId: 'checkers',
    gameName,
    initialBoard: createInitialCheckersBoard(),
    onGameEnd: (result, moves) => {
      if (result.winner === 'player1') {
        playWinSound();
      } else if (result.winner === 'ai') {
        playLoseSound();
      }
      recordMatchResult({
        gameId: 'checkers',
        gameName,
        result: result.winner === 'player1' ? 'win' : result.winner === 'ai' ? 'loss' : 'draw',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.playerName}: ${m.notation}`),
      });
    },
  });

  // Calculate all valid moves for a piece or player
  const getMovesForPiece = useCallback((b: CheckersBoard, r: number, c: number): MoveOption[] => {
    const piece = b[r][c];
    if (!piece) return [];

    const moves: MoveOption[] = [];
    const directions = [];

    if (piece.player === 'red' || piece.isKing) {
      directions.push([-1, -1], [-1, 1]); // Move up
    }
    if (piece.player === 'black' || piece.isKing) {
      directions.push([1, -1], [1, 1]); // Move down
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      // Normal 1-step move
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] === null) {
        moves.push({ fromR: r, fromC: c, toR: nr, toC: nc, isJump: false });
      }

      // Jump capture move
      const jr = r + dr * 2;
      const jc = c + dc * 2;
      if (
        jr >= 0 &&
        jr < 8 &&
        jc >= 0 &&
        jc < 8 &&
        b[nr] &&
        b[nr][nc] !== null &&
        b[nr][nc]!.player !== piece.player &&
        b[jr][jc] === null
      ) {
        moves.push({
          fromR: r,
          fromC: c,
          toR: jr,
          toC: jc,
          isJump: true,
          jumpedR: nr,
          jumpedC: nc,
        });
      }
    }

    return moves;
  }, []);

  const getAllMovesForPlayer = useCallback(
    (b: CheckersBoard, player: 'red' | 'black'): MoveOption[] => {
      const allMoves: MoveOption[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (b[r][c]?.player === player) {
            allMoves.push(...getMovesForPiece(b, r, c));
          }
        }
      }
      // Checkers mandatory jump rule: if jumps exist, return only jumps
      const jumps = allMoves.filter((m) => m.isJump);
      return jumps.length > 0 ? jumps : allMoves;
    },
    [getMovesForPiece]
  );

  // Check victory condition
  const checkGameOver = useCallback(
    (b: CheckersBoard) => {
      const redMoves = getAllMovesForPlayer(b, 'red');
      const blackMoves = getAllMovesForPlayer(b, 'black');

      let redCount = 0;
      let blackCount = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (b[r][c]?.player === 'red') redCount++;
          if (b[r][c]?.player === 'black') blackCount++;
        }
      }

      if (blackCount === 0 || blackMoves.length === 0) {
        recorder.finishGame({
          winner: 'player1',
          winnerName: 'You (Red)',
          reason: blackCount === 0 ? 'All AI pieces captured!' : 'AI has no legal moves remaining.',
        });
        return true;
      }
      if (redCount === 0 || redMoves.length === 0) {
        recorder.finishGame({
          winner: 'ai',
          winnerName: 'AI Opponent (Black)',
          reason: redCount === 0 ? 'All your pieces were captured!' : 'You have no legal moves remaining.',
        });
        return true;
      }
      return false;
    },
    [getAllMovesForPlayer, recorder]
  );

  // AI turn execution
  useEffect(() => {
    if (!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode) {
      const timer = setTimeout(() => {
        const aiMoves = getAllMovesForPlayer(board, 'black');
        if (aiMoves.length === 0) {
          checkGameOver(board);
          return;
        }

        // Pick jump if available, otherwise random or highest rank move
        const jumps = aiMoves.filter((m) => m.isJump);
        const chosen =
          jumps.length > 0
            ? jumps[Math.floor(Math.random() * jumps.length)]
            : aiMoves[Math.floor(Math.random() * aiMoves.length)];

        const newBoard = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
        const movingPiece = newBoard[chosen.fromR][chosen.fromC]!;
        newBoard[chosen.fromR][chosen.fromC] = null;

        let crowned = false;
        // King promotion
        if (chosen.toR === 7 && !movingPiece.isKing) {
          movingPiece.isKing = true;
          crowned = true;
        }
        newBoard[chosen.toR][chosen.toC] = movingPiece;

        if (chosen.isJump && chosen.jumpedR !== undefined && chosen.jumpedC !== undefined) {
          newBoard[chosen.jumpedR][chosen.jumpedC] = null;
          playMoveSound('capture');
        } else {
          playMoveSound('place');
        }

        setBoard(newBoard);
        setLastMoveAnim({
          fromR: chosen.fromR,
          fromC: chosen.fromC,
          toR: chosen.toR,
          toC: chosen.toC,
          isJump: chosen.isJump,
          crowned,
        });

        const notation = `(${chosen.fromR},${chosen.fromC}) -> (${chosen.toR},${chosen.toC})${
          chosen.isJump ? ' [Jump]' : ''
        }`;
        const desc = `AI moved piece from [${chosen.fromR},${chosen.fromC}] to [${chosen.toR},${chosen.toC}]${
          chosen.isJump ? ' and captured your piece' : ''
        }`;

        recorder.recordMove({
          player: 'ai',
          playerName: 'AI Opponent (Black)',
          playerType: 'ai',
          notation,
          action: chosen.isJump ? 'Jump & Capture' : 'Move',
          description: desc,
          boardSnapshot: newBoard,
          highlightCells: [
            { row: chosen.fromR, col: chosen.fromC, type: 'from' },
            { row: chosen.toR, col: chosen.toC, type: 'to' },
          ],
        });

        if (!checkGameOver(newBoard)) {
          setIsPlayerTurn(true);
        }
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, recorder, getAllMovesForPlayer, checkGameOver, playMoveSound]);

  // Handle player square clicks
  const validPlayerMoves = selectedSquare
    ? getMovesForPiece(board, selectedSquare[0], selectedSquare[1])
    : [];

  const handleSquareClick = (r: number, c: number) => {
    if (recorder.isReviewMode || recorder.isGameOver || !isPlayerTurn) return;

    const clickedPiece = board[r][c];

    // If clicking own piece, select it
    if (clickedPiece && clickedPiece.player === 'red') {
      setSelectedSquare([r, c]);
      return;
    }

    // If already selected a piece, check if this is a legal move
    if (selectedSquare) {
      const move = validPlayerMoves.find((m) => m.toR === r && m.toC === c);
      if (move) {
        const newBoard = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
        const piece = newBoard[move.fromR][move.fromC]!;
        newBoard[move.fromR][move.fromC] = null;

        let crowned = false;
        if (move.toR === 0 && !piece.isKing) {
          piece.isKing = true;
          crowned = true;
        }
        newBoard[move.toR][move.toC] = piece;

        if (move.isJump && move.jumpedR !== undefined && move.jumpedC !== undefined) {
          newBoard[move.jumpedR][move.jumpedC] = null;
          playMoveSound('capture');
        } else {
          playMoveSound('place');
        }

        setBoard(newBoard);
        setSelectedSquare(null);
        setLastMoveAnim({
          fromR: move.fromR,
          fromC: move.fromC,
          toR: move.toR,
          toC: move.toC,
          isJump: move.isJump,
          crowned,
        });

        const notation = `(${move.fromR},${move.fromC}) -> (${move.toR},${move.toC})${
          move.isJump ? ' [Jump]' : ''
        }`;
        const desc = `You moved piece to [${move.toR},${move.toC}]${
          move.isJump ? ' and captured AI piece' : ''
        }`;

        recorder.recordMove({
          player: 'player1',
          playerName: 'You (Red)',
          playerType: 'human',
          notation,
          action: move.isJump ? 'Jump & Capture' : 'Move',
          description: desc,
          boardSnapshot: newBoard,
          highlightCells: [
            { row: move.fromR, col: move.fromC, type: 'from' },
            { row: move.toR, col: move.toC, type: 'to' },
          ],
        });

        if (!checkGameOver(newBoard)) {
          setIsPlayerTurn(false);
        }
      } else {
        setSelectedSquare(null);
      }
    }
  };

  const handleRestart = () => {
    const fresh = createInitialCheckersBoard();
    setBoard(fresh);
    setSelectedSquare(null);
    setLastMoveAnim(null);
    setIsPlayerTurn(true);
    recorder.resetGame(fresh);
  };

  const displayBoard: CheckersBoard = recorder.isReviewMode
    ? recorder.activeSnapshot || createInitialCheckersBoard()
    : board;

  const activeHighlights = recorder.activeHighlights;

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Diagonal Capture"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage={isPlayerTurn ? 'Select a red piece to move' : 'AI is calculating move...'}
      isAiTurn={!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode}
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* 8x8 Board - Strictly Square */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[min(88vw,440px)] aspect-square p-2 sm:p-3 rounded-3xl border shadow-2xl relative overflow-hidden flex items-center justify-center transition-colors"
        >
          <div
            style={{
              backgroundColor: 'var(--theme-grid-bg, #020617)',
              borderColor: 'var(--theme-board-border, #1e293b)',
            }}
            className="grid grid-cols-8 grid-rows-8 gap-0 border-2 rounded-2xl overflow-hidden w-full h-full aspect-square relative"
          >
            {displayBoard.map((row, r) =>
              row.map((cell, c) => {
                const isDarkSquare = (r + c) % 2 === 1;
                const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
                const isValidTarget = validPlayerMoves.some((m) => m.toR === r && m.toC === c);
                const isReviewHighlight = activeHighlights.some((h) => h.row === r && h.col === c);

                const isJustMoved =
                  lastMoveAnim && lastMoveAnim.toR === r && lastMoveAnim.toC === c;

                // Relative offsets for smooth CSS translation
                const deltaX = lastMoveAnim ? (lastMoveAnim.fromC - lastMoveAnim.toC) * 100 : 0;
                const deltaY = lastMoveAnim ? (lastMoveAnim.fromR - lastMoveAnim.toR) * 100 : 0;

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    style={{
                      backgroundColor: isDarkSquare
                        ? 'var(--theme-cell-dark, #0f172a)'
                        : 'var(--theme-cell-light, #1e293b)',
                    }}
                    className={`aspect-square w-full h-full relative flex items-center justify-center select-none overflow-hidden transition-colors ${
                      isSelected ? 'ring-2 ring-amber-400 brightness-125' : ''
                    } ${
                      isReviewHighlight ? 'anim-highlight-pulse ring-2 ring-cyan-400 bg-[var(--theme-highlight-move)]' : ''
                    } ${isValidTarget ? 'cursor-pointer hover:brightness-125' : ''}`}
                  >
                    {/* Target move dot */}
                    {isValidTarget && !cell && (
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400/80 animate-ping" />
                    )}

                    {/* Pieces - centered without distorting cell geometry */}
                    {cell && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          style={{
                            ...(isJustMoved
                              ? ({
                                  '--jump-x': `${deltaX}%`,
                                  '--jump-y': `${deltaY}%`,
                                  '--slide-x': `${deltaX}%`,
                                  '--slide-y': `${deltaY}%`,
                                } as React.CSSProperties)
                              : {}),
                            backgroundColor:
                              cell.player === 'red'
                                ? 'var(--theme-piece-player, #06b6d4)'
                                : 'var(--theme-piece-opponent, #f43f5e)',
                            borderColor:
                              cell.player === 'red'
                                ? 'var(--theme-piece-player-border, #67e8f9)'
                                : 'var(--theme-piece-opponent-border, #fda4af)',
                            color: '#ffffff',
                          }}
                          className={`w-[75%] h-[75%] rounded-full flex items-center justify-center shadow-lg select-none z-10 border-2 ${
                            isJustMoved
                              ? lastMoveAnim.isJump
                                ? 'anim-checker-jump'
                                : 'anim-piece-slide'
                              : ''
                          } ${
                            !recorder.isReviewMode && cell.player === 'red' && isPlayerTurn
                              ? 'hover:scale-105 active:scale-95 transition-transform'
                              : ''
                          }`}
                        >
                          {cell.isKing && (
                            <Crown
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300/70 ${
                                isJustMoved && lastMoveAnim.crowned ? 'anim-crown-burst' : ''
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs opacity-75">
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: 'var(--theme-piece-player, #06b6d4)',
                borderColor: 'var(--theme-piece-player-border, #67e8f9)',
              }}
              className="w-3.5 h-3.5 rounded-full border shadow-sm"
            />
            <span>You</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: 'var(--theme-piece-opponent, #f43f5e)',
                borderColor: 'var(--theme-piece-opponent-border, #fda4af)',
              }}
              className="w-3.5 h-3.5 rounded-full border shadow-sm"
            />
            <span>AI Opponent</span>
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default CheckersGame;
