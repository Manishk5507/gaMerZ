import React, { useEffect, useState } from 'react';
import { TicTacToe } from './components/games/TicTacToe';
import { NumberGuess } from './components/games/NumberGuess';

interface GameMeta { id: string; name: string }

type ActiveGame = { type: 'tictactoe'; gameId: string } | { type: 'numberguess'; gameId: string } | null;

export const App: React.FC = () => {
  const [games, setGames] = useState<GameMeta[]>([]);
  const [active, setActive] = useState<ActiveGame>(null);

  useEffect(() => {
    fetch('/api/games/list').then(r => r.json()).then(setGames).catch(console.error);
  }, []);

  const startGame = async (id: string) => {
    const res = await fetch(`/api/games/${id}/new`, { method: 'POST' });
    const data = await res.json();
    setActive({ type: id as any, gameId: data.gameId });
  };

  const leaveGame = () => setActive(null);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>gaMerZ</h1>
      {!active && (
        <>
          <h2>Pick a Game</h2>
          <ul>
            {games.map(g => (
              <li key={g.id}>
                <button onClick={() => startGame(g.id)}>{g.name}</button>
              </li>
            ))}
          </ul>
        </>
      )}
      {active?.type === 'tictactoe' && <TicTacToe gameId={active.gameId} onExit={leaveGame} />}
      {active?.type === 'numberguess' && <NumberGuess gameId={active.gameId} onExit={leaveGame} />}
    </div>
  );
};
