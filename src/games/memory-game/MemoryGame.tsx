import React, { useState, useEffect, useContext } from 'react';
import { GameComponentProps } from '../../types';
import { useMoveRecorder } from '../../hooks/useMoveRecorder';
import BaseGameContainer from '../../components/base/BaseGameContainer';
import { GameAudioContext } from '../../contexts/AudioContext';
import { AuthContext } from '../../contexts/AuthContext';

const ICONS = ['🚀', '💎', '🎲', '🎯', '👑', '⚡', '🍀', '🪐'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function createShuffledDeck(): Card[] {
  const deck = [...ICONS, ...ICONS].map((icon, index) => ({
    id: index,
    icon,
    isFlipped: false,
    isMatched: false,
  }));
  return deck.sort(() => Math.random() - 0.5);
}

export const MemoryGame: React.FC<GameComponentProps> = ({ onBackToLobby, gameName }) => {
  const { playMoveSound, playWinSound, soundEnabled, toggleSound } = useContext(GameAudioContext);
  const { recordMatchResult } = useContext(AuthContext);

  const [cards, setCards] = useState<Card[]>(createShuffledDeck);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [justMatchedPair, setJustMatchedPair] = useState<number[] | null>(null);

  const recorder = useMoveRecorder<Card[]>({
    gameId: 'memory-game',
    gameName,
    initialBoard: createShuffledDeck(),
    onGameEnd: (result, moves) => {
      playWinSound();
      recordMatchResult({
        gameId: 'memory-game',
        gameName,
        result: 'win',
        turns: moves.length,
        durationSeconds: result.durationSeconds,
        moveHistorySummary: moves.map((m) => `${m.notation}`),
      });
    },
  });

  const handleCardClick = (index: number) => {
    if (
      recorder.isReviewMode ||
      recorder.isGameOver ||
      isProcessing ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    playMoveSound('flip');
    const newCards = cards.map((c, i) => (i === index ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flippedIndices, index];

    setCards(newCards);
    setFlippedIndices(newFlipped);

    // If 2 cards flipped
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [idx1, idx2] = newFlipped;
      const card1 = newCards[idx1];
      const card2 = newCards[idx2];
      const isMatch = card1.icon === card2.icon;

      setTimeout(() => {
        let finalCards: Card[];
        if (isMatch) {
          playMoveSound('capture');
          setJustMatchedPair([idx1, idx2]);
          finalCards = newCards.map((c, i) =>
            i === idx1 || i === idx2 ? { ...c, isMatched: true, isFlipped: true } : c
          );
        } else {
          finalCards = newCards.map((c, i) =>
            i === idx1 || i === idx2 ? { ...c, isFlipped: false } : c
          );
        }

        setCards(finalCards);
        setFlippedIndices([]);
        setIsProcessing(false);

        const notation = `#${idx1 + 1} & #${idx2 + 1}: ${card1.icon} ${
          isMatch ? '===' : '≠'
        } ${card2.icon}`;
        const desc = isMatch
          ? `Matched pair of ${card1.icon} at positions ${idx1 + 1} and ${idx2 + 1}!`
          : `Revealed ${card1.icon} and ${card2.icon} (No match)`;

        recorder.recordMove({
          player: 'player1',
          playerName: 'You',
          playerType: 'human',
          notation,
          action: isMatch ? 'Pair Matched' : 'Mismatch',
          description: desc,
          boardSnapshot: finalCards,
          highlightCells: [
            { index: idx1, type: isMatch ? 'placed' : 'selected' },
            { index: idx2, type: isMatch ? 'placed' : 'selected' },
          ],
        });

        // Check if all matched
        if (finalCards.every((c) => c.isMatched)) {
          recorder.finishGame({
            winner: 'player1',
            winnerName: 'You',
            reason: `All 8 pairs discovered in ${recorder.moves.length + 1} turns!`,
          });
        }
      }, 700);
    }
  };

  const handleRestart = () => {
    const fresh = createShuffledDeck();
    setCards(fresh);
    setFlippedIndices([]);
    setIsProcessing(false);
    setJustMatchedPair(null);
    recorder.resetGame(fresh);
  };

  const displayCards: Card[] = recorder.isReviewMode
    ? recorder.activeSnapshot || cards
    : cards;

  const activeHighlightedIndices = recorder.activeHighlights
    .map((h) => h.index)
    .filter((i): i is number => i !== undefined);

  return (
    <BaseGameContainer
      gameName={gameName}
      gameCategory="Cognitive Puzzle"
      onBackToLobby={onBackToLobby}
      recorder={recorder}
      onRestartGame={handleRestart}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      statusMessage="Flip cards to find all matching pairs"
    >
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Memory Grid - Strictly Square */}
        <div
          style={{
            backgroundColor: 'var(--theme-board-casing, #091322)',
            borderColor: 'var(--theme-board-border, #1e293b)',
          }}
          className="w-full max-w-[min(88vw,420px)] aspect-square p-3 sm:p-4 rounded-3xl border shadow-2xl flex items-center justify-center overflow-hidden transition-colors"
        >
          <div className="grid grid-cols-4 grid-rows-4 gap-2.5 sm:gap-3 w-full h-full aspect-square">
            {displayCards.map((card, idx) => {
              const isFlipped = card.isFlipped || card.isMatched || recorder.isReviewMode;
              const isHighlighted = activeHighlightedIndices.includes(idx);
              const isJustMatched = justMatchedPair?.includes(idx);

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className="perspective-1000 aspect-square w-full h-full cursor-pointer relative overflow-hidden"
                >
                  <div
                    className={`card-flip-inner relative w-full h-full rounded-2xl select-none ${
                      isFlipped ? 'is-flipped' : ''
                    } ${isJustMatched ? 'anim-card-matched' : ''} ${
                      isHighlighted ? 'anim-highlight-pulse ring-4 ring-cyan-400' : ''
                    }`}
                  >
                    {/* Card Back (Unflipped) */}
                    <div
                      style={{
                        backgroundColor: 'var(--theme-cell-dark, #0f172a)',
                        borderColor: 'var(--theme-border-hairline, #1e293b)',
                      }}
                      className="backface-hidden absolute inset-0 w-full h-full rounded-2xl border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
                    >
                      <span className="text-2xl font-black opacity-40 font-mono select-none leading-none">?</span>
                    </div>

                    {/* Card Front (Flipped & Showing Symbol) */}
                    <div
                      style={{
                        backgroundColor: card.isMatched ? 'var(--theme-highlight-move)' : 'var(--theme-cell-light, #1e293b)',
                        borderColor: card.isMatched ? 'var(--theme-accent-primary)' : 'var(--theme-border-hairline)',
                      }}
                      className="backface-hidden absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2 [transform:rotateY(180deg)] select-none overflow-hidden"
                    >
                      <span className="leading-none">{card.icon}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BaseGameContainer>
  );
};

export default MemoryGame;
