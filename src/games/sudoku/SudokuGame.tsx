import React, { useState, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';

type SudokuGrid = (number | null)[][];

const SAMPLE_PUZZLE: SudokuGrid = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

export const SudokuGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const [grid, setGrid] = useState<SudokuGrid>(() => SAMPLE_PUZZLE.map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const recorder = useMoveRecorder<SudokuGrid>({
    gameId: 'sudoku',
    gameName,
    initialBoard: SAMPLE_PUZZLE.map((r) => [...r]),
    onGameEnd: (result, moves) => {
      playWinSound();
      recordMatchResult({
        gameId: 'sudoku',
        gameName,
        result: 'win',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.notation}`),
      });
    },
  });

  const isInitialCell = (r: number, c: number) => SAMPLE_PUZZLE[r][c] !== null;

  const handleCellClick = (r: number, c: number) => {
    if (recorder.isReviewMode || recorder.isGameOver) return;
    if (!isInitialCell(r, c)) {
      setSelectedCell([r, c]);
    }
  };

  const handleInputNumber = (val: number | null) => {
    if (recorder.isReviewMode || recorder.isGameOver || !selectedCell) return;
    const [r, c] = selectedCell;
    if (isInitialCell(r, c)) return;

    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = val;
    setGrid(newGrid);
    playMoveSound('place');

    const notation = val ? `R${r + 1}C${c + 1} = ${val}` : `R${r + 1}C${c + 1} Erased`;
    const desc = val
      ? `Placed number ${val} in Row ${r + 1}, Col ${c + 1}`
      : `Erased number at Row ${r + 1}, Col ${c + 1}`;

    recorder.recordMove({
      player: 'player1',
      playerName: 'You',
      playerType: 'human',
      notation,
      action: val ? `Input ${val}` : 'Erase',
      description: desc,
      boardSnapshot: newGrid,
      highlightCells: [{ row: r, col: c, type: 'placed' }],
    });

    // Check complete
    const isComplete = newGrid.every((row) => row.every((cell) => cell !== null));
    if (isComplete) {
      recorder.finishGame({
        winner: 'player1',
        winnerName: 'You',
        reason: 'Sudoku puzzle successfully completed!',
      });
    }
  };

  const handleRestart = () => {
    const fresh = SAMPLE_PUZZLE.map((r) => [...r]);
    setGrid(fresh);
    setSelectedCell(null);
    recorder.resetGame(fresh);
  };

  const displayGrid: SudokuGrid = recorder.isReviewMode
    ? recorder.activeSnapshot || SAMPLE_PUZZLE
    : grid;

  const activeHighlights = recorder.activeHighlights;

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Number Logic"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage="Select a cell and input 1-9 to complete the grid"
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* 9x9 Board - Strictly Square */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[min(88vw,440px)] aspect-square p-2 sm:p-3 rounded-3xl border shadow-2xl flex items-center justify-center overflow-hidden transition-colors"
        >
          <div
            style={{
              backgroundColor: 'var(--theme-grid-bg, #020617)',
              borderColor: 'var(--theme-board-border, #1e293b)',
            }}
            className="grid grid-cols-9 grid-rows-9 gap-0 border-2 rounded-xl overflow-hidden w-full h-full aspect-square relative"
          >
            {displayGrid.map((row, r) =>
              row.map((val, c) => {
                const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                const isInitial = isInitialCell(r, c);
                const isHighlight = activeHighlights.some((h) => h.row === r && h.col === c);

                const borderR = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-slate-600' : 'border-b border-slate-800/60';
                const borderC = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-slate-600' : 'border-r border-slate-800/60';

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--theme-accent-glow)'
                        : isHighlight
                        ? 'var(--theme-highlight-move)'
                        : 'var(--theme-cell-light, #1e293b)',
                      color: isInitial
                        ? 'var(--theme-text-primary)'
                        : 'var(--theme-accent-hover)',
                    }}
                    className={`aspect-square w-full h-full relative flex items-center justify-center font-mono font-bold text-xs sm:text-base select-none overflow-hidden transition-colors ${borderR} ${borderC} ${
                      isSelected ? 'ring-2 ring-[var(--theme-accent-primary)] z-10' : ''
                    } ${
                      !isInitial && !recorder.isReviewMode
                        ? 'cursor-pointer hover:brightness-125'
                        : ''
                    }`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center leading-none pointer-events-none select-none">
                      {val !== null ? val : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Numpad */}
        {!recorder.isReviewMode && !recorder.isGameOver && (
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleInputNumber(num)}
                style={{
                  backgroundColor: 'var(--theme-surface-card, #0f172a)',
                  borderColor: 'var(--theme-border-hairline, #1e293b)',
                  color: 'var(--theme-text-primary, #f8fafc)',
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-[var(--theme-accent-primary)] hover:text-slate-950 font-bold font-mono transition-colors border"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleInputNumber(null)}
              style={{
                backgroundColor: 'var(--theme-surface-card, #0f172a)',
                borderColor: 'var(--theme-border-hairline, #1e293b)',
              }}
              className="px-2.5 h-8 sm:h-9 rounded-xl hover:bg-rose-500/40 text-rose-300 font-medium text-xs border"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </BaseGameContainer>
  );
};

export default SudokuGame;
