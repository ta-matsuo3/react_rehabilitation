import { useEffect, useMemo, useState } from 'react';

const GAME_CONFIG = {
  pairCount: 8,
  initialLives: 3,
  baseScore: 100,
  clearBonus: 250,
  mismatchPenalty: 1,
};

const SYMBOLS = ['🍒', '🍋', '🍉', '🍇', '🍊', '🍏', '🍎', '🍓'];

function shuffleCards(items) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

function createDeck(pairCount = GAME_CONFIG.pairCount) {
  const selectedSymbols = SYMBOLS.slice(0, pairCount / 2);

  const deck = selectedSymbols.flatMap((symbol, symbolIndex) => [
    { id: `${symbol}-${symbolIndex}-a`, value: symbol, matched: false },
    { id: `${symbol}-${symbolIndex}-b`, value: symbol, matched: false },
  ]);

  return shuffleCards(deck);
}

export default function App() {
  const [cards, setCards] = useState(() => createDeck());
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(GAME_CONFIG.initialLives);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [status, setStatus] = useState('ready');
  const [isLocked, setIsLocked] = useState(false);

  const totalPairs = useMemo(() => cards.length / 2, [cards.length]);

  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      setStatus('clear');
      setScore((current) => current + GAME_CONFIG.clearBonus);
    }
  }, [matchedPairs, totalPairs]);

  const resetGame = () => {
    setCards(createDeck());
    setSelectedIndexes([]);
    setScore(0);
    setLives(GAME_CONFIG.initialLives);
    setMoves(0);
    setMatchedPairs(0);
    setStatus('ready');
    setIsLocked(false);
  };

  const handleCardClick = (clickedIndex) => {
    if (
      isLocked ||
      selectedIndexes.includes(clickedIndex) ||
      cards[clickedIndex]?.matched ||
      status === 'game-over' ||
      status === 'clear'
    ) {
      return;
    }

    const nextSelection = [...selectedIndexes, clickedIndex];
    setSelectedIndexes(nextSelection);

    if (nextSelection.length === 2) {
      const [firstIndex, secondIndex] = nextSelection;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      setMoves((current) => current + 1);
      setStatus('playing');

      if (firstCard.value === secondCard.value) {
        setCards((currentCards) =>
          currentCards.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, matched: true }
              : card,
          ),
        );
        setMatchedPairs((current) => current + 1);
        setScore((current) => current + GAME_CONFIG.baseScore);
        setSelectedIndexes([]);
        return;
      }

      const updatedLives = lives - GAME_CONFIG.mismatchPenalty;
      setLives(updatedLives);

      if (updatedLives <= 0) {
        setStatus('game-over');
      }

      setIsLocked(true);
      setTimeout(() => {
        setSelectedIndexes([]);
        setIsLocked(false);
      }, 700);
    }
  };

  return (
    <main className="game-page">
      <section className="memory-game-shell">
        <div className="memory-game-header">
          <div>
            <p className="memory-game-label">Mini Game</p>
            <h1>Memory Match</h1>
          </div>
          <button type="button" onClick={resetGame} className="memory-game-reset">
            Reset
          </button>
        </div>

        <div className="memory-game-stats">
          <div className="memory-game-stat">
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div className="memory-game-stat">
            <span>Moves</span>
            <strong>{moves}</strong>
          </div>
          <div className="memory-game-stat">
            <span>Lives</span>
            <strong>{lives}</strong>
          </div>
        </div>

        <div className="memory-game-status">
          {status === 'ready' && 'Press any card to start.'}
          {status === 'playing' && 'Find the matching pairs!'}
          {status === 'clear' && 'You cleared the board! Great job.'}
          {status === 'game-over' && 'Game over. Try again!'}
        </div>

        <div className="memory-game-board" role="grid" aria-label="Memory game board">
          {cards.map((card, index) => {
            const isOpen = selectedIndexes.includes(index) || card.matched;
            const isMatched = card.matched;

            return (
              <button
                key={card.id}
                type="button"
                className={[
                  'memory-game-card',
                  isOpen ? 'is-open' : '',
                  isMatched ? 'is-matched' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleCardClick(index)}
                disabled={isLocked || isMatched || status === 'game-over'}
                aria-label={isOpen ? `Card ${card.value}` : 'Hidden card'}
              >
                <span>{isOpen ? card.value : '?'}</span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
