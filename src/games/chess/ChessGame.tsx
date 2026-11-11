import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Chess } from 'chess.js';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';

// Chess piece SVG symbols mapping
const PIECE_SYMBOLS: Record<string, string> = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
};

const PIECE_NAMES: Record<string, string> = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};

interface ChessSnapshot {
  fen: string;
  inCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}

export const ChessGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, playLoseSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true); // White = Human, Black = AI
  const [lastMoveAnim, setLastMoveAnim] = useState<{ from: string; to: string } | null>(null);

  const initialSnapshot: ChessSnapshot = {
    fen: new Chess().fen(),
    inCheck: false,
    isCheckmate: false,
    isDraw: false,
  };

  const recorder = useMoveRecorder<ChessSnapshot>({
    gameId: 'chess',
    gameName,
    initialBoard: initialSnapshot,
    onGameEnd: (result, moves) => {
      if (result.winner === 'player1') {
        playWinSound();
      } else if (result.winner === 'ai') {
        playLoseSound();
      }
      recordMatchResult({
        gameId: 'chess',
        gameName,
        result: result.winner === 'player1' ? 'win' : result.winner === 'ai' ? 'loss' : 'draw',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.playerName}: ${m.notation}`),
      });
    },
  });

  // Evaluate simple piece value for AI decision
  const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3.2,
    r: 5,
    q: 9,
    k: 100,
  };

  // AI Move calculation
  const getAiMove = useCallback((chessInstance: Chess) => {
    const moves = chessInstance.moves({ verbose: true });
    if (moves.length === 0) return null;

    // 1. Checkmate move
    for (const m of moves) {
      const copy = new Chess(chessInstance.fen());
      copy.move(m);
      if (copy.isCheckmate()) return m;
    }

    // 2. Capture highest value piece
    let bestCapture = null;
    let maxCaptureVal = 0;
    for (const m of moves) {
      if (m.captured) {
        const val = pieceValues[m.captured] || 1;
        if (val > maxCaptureVal) {
          maxCaptureVal = val;
          bestCapture = m;
        }
      }
    }
    if (bestCapture && Math.random() < 0.75) return bestCapture;

    // 3. Center pawn/knight moves
    const centerMoves = moves.filter((m) => ['d5', 'e5', 'd6', 'e6', 'c6', 'f6'].includes(m.to));
    if (centerMoves.length > 0 && Math.random() < 0.5) {
      return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    }

    // 4. Random legal move
    return moves[Math.floor(Math.random() * moves.length)];
  }, []);

  // AI turn loop
  useEffect(() => {
    if (!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode) {
      const timer = setTimeout(() => {
        const aiMove = getAiMove(game);
        if (!aiMove) {
          if (game.isCheckmate()) {
            recorder.finishGame({
              winner: 'player1',
              winnerName: 'You (White)',
              reason: 'Checkmate! You defeated the AI.',
            });
          } else if (game.isDraw()) {
            recorder.finishGame({
              winner: 'draw',
              reason: 'Game ended in a draw.',
            });
          }
          return;
        }

        const newGame = new Chess(game.fen());
        const moveResult = newGame.move(aiMove);
        setGame(newGame);
        setLastMoveAnim({ from: aiMove.from, to: aiMove.to });

        if (moveResult.captured) {
          playMoveSound('capture');
        } else {
          playMoveSound('place');
        }

        const newSnapshot: ChessSnapshot = {
          fen: newGame.fen(),
          inCheck: newGame.inCheck(),
          isCheckmate: newGame.isCheckmate(),
          isDraw: newGame.isDraw(),
        };

        const pieceName = PIECE_NAMES[aiMove.piece] || 'Piece';
        const desc = aiMove.captured
          ? `AI moved ${pieceName} to ${aiMove.to} and captured ${PIECE_NAMES[aiMove.captured] || 'piece'}`
          : `AI moved ${pieceName} from ${aiMove.from} to ${aiMove.to}`;

        const fromC = aiMove.from.charCodeAt(0) - 97;
        const fromR = 8 - parseInt(aiMove.from[1], 10);
        const toC = aiMove.to.charCodeAt(0) - 97;
        const toR = 8 - parseInt(aiMove.to[1], 10);

        recorder.recordMove({
          player: 'ai',
          playerName: 'AI Opponent (Black)',
          playerType: 'ai',
          notation: aiMove.san,
          action: newGame.isCheckmate()
            ? 'Checkmate'
            : newGame.inCheck()
            ? 'Check'
            : aiMove.captured
            ? 'Capture'
            : 'Move',
          description: desc,
          boardSnapshot: newSnapshot,
          highlightCells: [
            { row: fromR, col: fromC, key: aiMove.from, type: 'from' },
            { row: toR, col: toC, key: aiMove.to, type: 'to' },
          ],
          captured: aiMove.captured,
        });

        if (newGame.isCheckmate()) {
          recorder.finishGame({
            winner: 'ai',
            winnerName: 'AI Opponent (Black)',
            reason: 'Checkmate! AI defeated your king.',
          });
        } else if (newGame.isDraw()) {
          recorder.finishGame({
            winner: 'draw',
            reason: newGame.isStalemate() ? 'Stalemate' : 'Draw',
          });
        } else {
          setIsPlayerTurn(true);
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, game, recorder, getAiMove, playMoveSound]);

  // Handle square selection for player
  const handleSquareClick = (squareKey: string) => {
    if (recorder.isReviewMode || recorder.isGameOver || !isPlayerTurn) return;

    // If clicking a square with a player's white piece, select it and show legal moves
    const piece = game.get(squareKey as any);
    if (piece && piece.color === 'w') {
      setSelectedSquare(squareKey);
      const moves = game.moves({ square: squareKey as any, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
      return;
    }

    // If a piece was selected and clicking a legal destination
    if (selectedSquare && legalMoves.includes(squareKey)) {
      const newGame = new Chess(game.fen());
      const moveResult = newGame.move({
        from: selectedSquare,
        to: squareKey,
        promotion: 'q',
      });

      if (moveResult) {
        setGame(newGame);
        setLastMoveAnim({ from: selectedSquare, to: squareKey });
        setSelectedSquare(null);
        setLegalMoves([]);

        if (moveResult.captured) {
          playMoveSound('capture');
        } else {
          playMoveSound('place');
        }

        const newSnapshot: ChessSnapshot = {
          fen: newGame.fen(),
          inCheck: newGame.inCheck(),
          isCheckmate: newGame.isCheckmate(),
          isDraw: newGame.isDraw(),
        };

        const fromC = selectedSquare.charCodeAt(0) - 97;
        const fromR = 8 - parseInt(selectedSquare[1], 10);
        const toC = squareKey.charCodeAt(0) - 97;
        const toR = 8 - parseInt(squareKey[1], 10);

        const pieceName = PIECE_NAMES[moveResult.piece] || 'Piece';
        const desc = moveResult.captured
          ? `You moved ${pieceName} to ${squareKey} and captured ${PIECE_NAMES[moveResult.captured] || 'piece'}`
          : `You moved ${pieceName} to ${squareKey}`;

        recorder.recordMove({
          player: 'player1',
          playerName: 'You (White)',
          playerType: 'human',
          notation: moveResult.san,
          action: newGame.isCheckmate()
            ? 'Checkmate'
            : newGame.inCheck()
            ? 'Check'
            : moveResult.captured
            ? 'Capture'
            : 'Move',
          description: desc,
          boardSnapshot: newSnapshot,
          highlightCells: [
            { row: fromR, col: fromC, key: selectedSquare, type: 'from' },
            { row: toR, col: toC, key: squareKey, type: 'to' },
          ],
          captured: moveResult.captured,
        });

        if (newGame.isCheckmate()) {
          recorder.finishGame({
            winner: 'player1',
            winnerName: 'You (White)',
            reason: 'Checkmate! You defeated the AI king.',
          });
        } else if (newGame.isDraw()) {
          recorder.finishGame({
            winner: 'draw',
            reason: newGame.isStalemate() ? 'Stalemate' : 'Draw',
          });
        } else {
          setIsPlayerTurn(false);
        }
      }
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleRestart = () => {
    const fresh = new Chess();
    setGame(fresh);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMoveAnim(null);
    setIsPlayerTurn(true);
    recorder.resetGame({
      fen: fresh.fen(),
      inCheck: false,
      isCheckmate: false,
      isDraw: false,
    });
  };

  // Compute active board to display
  const activeChessInstance = React.useMemo(() => {
    if (recorder.isReviewMode && recorder.activeSnapshot?.fen) {
      try {
        return new Chess(recorder.activeSnapshot.fen);
      } catch {
        return game;
      }
    }
    return game;
  }, [recorder.isReviewMode, recorder.activeSnapshot, game]);

  const activeBoard = activeChessInstance.board();
  const activeHighlights = recorder.activeHighlights;

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Grand Strategy"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage={
        game.inCheck()
          ? 'Check! Protect your king'
          : isPlayerTurn
          ? 'Your turn (White)'
          : 'AI is thinking (Black)...'
      }
      isAiTurn={!isPlayerTurn && !recorder.isGameOver && !recorder.isReviewMode}
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* 8x8 Chessboard: Strictly Square with Identical Square Cells */}
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
            {activeBoard.map((row, r) =>
              row.map((cell, c) => {
                const isLight = (r + c) % 2 === 0;
                const file = String.fromCharCode(97 + c);
                const rank = (8 - r).toString();
                const squareKey = `${file}${rank}`;

                const isSelected = selectedSquare === squareKey;
                const isLegalMove = legalMoves.includes(squareKey);
                const isReviewHighlight = activeHighlights.some(
                  (h) => h.key === squareKey || (h.row === r && h.col === c)
                );

                // Determine if this square received the last move
                let slideX = 0;
                let slideY = 0;
                let hasJustMoved = false;

                if (!recorder.isReviewMode && lastMoveAnim && lastMoveAnim.to === squareKey) {
                  const fromC = lastMoveAnim.from.charCodeAt(0) - 97;
                  const fromR = 8 - parseInt(lastMoveAnim.from[1], 10);
                  slideX = (fromC - c) * 100;
                  slideY = (fromR - r) * 100;
                  hasJustMoved = true;
                } else if (recorder.isReviewMode && recorder.activeMove) {
                  const toCell = activeHighlights.find((h) => h.type === 'to');
                  const fromCell = activeHighlights.find((h) => h.type === 'from');
                  if (toCell && toCell.key === squareKey && fromCell && fromCell.row !== undefined && fromCell.col !== undefined) {
                    slideX = (fromCell.col - c) * 100;
                    slideY = (fromCell.row - r) * 100;
                    hasJustMoved = true;
                  }
                }

                const pieceKey = cell ? `${cell.color}${cell.type}` : null;
                const symbol = pieceKey ? PIECE_SYMBOLS[pieceKey] : null;

                const isKingInCheck =
                  cell?.type === 'k' &&
                  ((cell.color === 'w' && isPlayerTurn && game.inCheck()) ||
                    (cell.color === 'b' && !isPlayerTurn && game.inCheck()));

                return (
                  <div
                    key={squareKey}
                    onClick={() => handleSquareClick(squareKey)}
                    style={{
                      backgroundColor: isLight
                        ? 'var(--theme-cell-light, #1e293b)'
                        : 'var(--theme-cell-dark, #0f172a)',
                      color: isLight
                        ? 'var(--theme-cell-text-light, #f1f5f9)'
                        : 'var(--theme-cell-text-dark, #94a3b8)',
                    }}
                    className={`aspect-square w-full h-full relative flex items-center justify-center select-none overflow-hidden transition-colors ${
                      isSelected ? 'ring-2 ring-amber-400 z-20 brightness-125' : ''
                    } ${
                      isReviewHighlight
                        ? 'anim-highlight-pulse ring-2 ring-cyan-400 bg-[var(--theme-highlight-move)] z-10'
                        : ''
                    } ${isKingInCheck ? 'anim-win-glow ring-2 ring-rose-500 z-10' : ''} ${
                      !recorder.isReviewMode && cell?.color === 'w' && isPlayerTurn
                        ? 'cursor-pointer hover:brightness-110 active:scale-95 transition-transform'
                        : isLegalMove
                        ? 'cursor-pointer'
                        : ''
                    }`}
                  >
                    {/* Rank/file labels */}
                    {c === 0 && (
                      <span className="absolute top-0.5 left-1 text-[8px] font-mono opacity-50 font-bold z-10 pointer-events-none">
                        {rank}
                      </span>
                    )}
                    {r === 7 && (
                      <span className="absolute bottom-0.5 right-1 text-[8px] font-mono opacity-50 font-bold z-10 pointer-events-none">
                        {file}
                      </span>
                    )}

                    {/* Legal move indicator dot */}
                    {isLegalMove && !cell && (
                      <div className="w-3 h-3 rounded-full bg-slate-900/40 animate-pulse pointer-events-none" />
                    )}

                    {/* Chess piece symbol centered in square */}
                    {symbol && (
                      <span
                        style={
                          hasJustMoved
                            ? ({
                                '--slide-x': `${slideX}%`,
                                '--slide-y': `${slideY}%`,
                              } as React.CSSProperties)
                            : undefined
                        }
                        className={`absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl leading-none select-none z-10 pointer-events-none ${
                          hasJustMoved ? 'anim-piece-slide' : ''
                        } ${
                          cell?.color === 'w'
                            ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                            : 'text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                        } ${isSelected ? 'scale-110' : ''}`}
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

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-base text-white">♔</span>
            <span>You (White)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-slate-400">♚</span>
            <span>AI Opponent (Black)</span>
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default ChessGame;
