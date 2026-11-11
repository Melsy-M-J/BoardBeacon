import React, { useState, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';

interface Tile {
  id: number;
  symbol: string;
  cleared: boolean;
}

const TILE_SYMBOLS = ['🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋', '🀌'];

function createMahjongTiles(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;
  // 4 of each symbol = 36 tiles (perfect 6x6 square grid)
  for (let s of TILE_SYMBOLS) {
    for (let i = 0; i < 4; i++) {
      tiles.push({ id: id++, symbol: s, cleared: false });
    }
  }
  return tiles.sort(() => Math.random() - 0.5);
}

export const MahjongGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const [tiles, setTiles] = useState<Tile[]>(createMahjongTiles);
  const [selectedTileId, setSelectedTileId] = useState<number | null>(null);

  const recorder = useMoveRecorder<Tile[]>({
    gameId: 'mahjong',
    gameName,
    initialBoard: createMahjongTiles(),
    onGameEnd: (result, moves) => {
      playWinSound();
      recordMatchResult({
        gameId: 'mahjong',
        gameName,
        result: 'win',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.notation}`),
      });
    },
  });

  const handleTileClick = (tile: Tile) => {
    if (recorder.isReviewMode || recorder.isGameOver || tile.cleared) return;

    if (selectedTileId === null) {
      setSelectedTileId(tile.id);
      playMoveSound('place');
      return;
    }

    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      return;
    }

    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) return;

    if (firstTile.symbol === tile.symbol) {
      playMoveSound('capture');
      const newTiles = tiles.map((t) =>
        t.id === firstTile.id || t.id === tile.id ? { ...t, cleared: true } : t
      );
      setTiles(newTiles);
      setSelectedTileId(null);

      const notation = `Pair ${tile.symbol} [Tiles #${firstTile.id + 1} & #${tile.id + 1}]`;
      const desc = `Matched and cleared pair of ${tile.symbol}`;

      recorder.recordMove({
        player: 'player1',
        playerName: 'You',
        playerType: 'human',
        notation,
        action: 'Clear Pair',
        description: desc,
        boardSnapshot: newTiles,
        highlightCells: [
          { index: firstTile.id, type: 'placed' },
          { index: tile.id, type: 'placed' },
        ],
      });

      if (newTiles.every((t) => t.cleared)) {
        recorder.finishGame({
          winner: 'player1',
          winnerName: 'You',
          reason: 'All Mahjong tiles cleared!',
        });
      }
    } else {
      setSelectedTileId(tile.id);
    }
  };

  const handleRestart = () => {
    const fresh = createMahjongTiles();
    setTiles(fresh);
    setSelectedTileId(null);
    recorder.resetGame(fresh);
  };

  const displayTiles: Tile[] = recorder.isReviewMode
    ? recorder.activeSnapshot || tiles
    : tiles;

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Solitaire Pairing"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage="Match pairs of identical tiles to clear the board"
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Mahjong Solitaire Board - Strictly Square */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[min(88vw,440px)] aspect-square p-3 sm:p-4 rounded-3xl border shadow-2xl flex items-center justify-center overflow-hidden transition-colors"
        >
          <div className="grid grid-cols-6 grid-rows-6 gap-2 sm:gap-2.5 w-full h-full aspect-square">
            {displayTiles.map((tile) => {
              const isSelected = selectedTileId === tile.id;
              return (
                <div
                  key={tile.id}
                  className="aspect-square w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center"
                >
                  {tile.cleared ? (
                    <div
                      style={{
                        backgroundColor: 'var(--theme-cell-dark, #0f172a)',
                        borderColor: 'var(--theme-border-hairline, #1e293b)',
                      }}
                      className="w-full h-full rounded-xl border opacity-30"
                    />
                  ) : (
                    <button
                      onClick={() => handleTileClick(tile)}
                      disabled={recorder.isReviewMode}
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--theme-accent-primary, #fbbf24)'
                          : 'var(--theme-cell-light, #f5f0e6)',
                        color: isSelected
                          ? '#020617'
                          : 'var(--theme-cell-text-light, #1c1917)',
                        borderColor: isSelected
                          ? 'var(--theme-accent-hover)'
                          : 'var(--theme-border-hairline)',
                      }}
                      className={`w-full h-full rounded-xl flex items-center justify-center text-2xl sm:text-3xl transition-all select-none border-b-4 shadow-md ${
                        isSelected
                          ? 'scale-105 ring-4 ring-[var(--theme-accent-primary)] shadow-xl'
                          : 'hover:brightness-110 cursor-pointer active:scale-95'
                      }`}
                    >
                      <span className="leading-none">{tile.symbol}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default MahjongGame;
