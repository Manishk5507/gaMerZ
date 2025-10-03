import React, { useEffect, useState } from 'react';
import { TicTacToe } from './components/games/TicTacToe';
import { NumberGuess } from './components/games/NumberGuess';
import { PuzzlePieceIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <PuzzlePieceIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold tracking-tight heading-gradient">gaMerZ</h1>
          {active && (
            <button onClick={leaveGame} className="ml-auto inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white transition">
              <ArrowLeftIcon className="h-4 w-4" /> Back
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        {!active && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-medium text-slate-200 mb-2">Pick a Game</h2>
              <p className="text-sm text-slate-400">Choose a mini-game below to start playing instantly.</p>
            </section>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {games.map(g => (
                <li key={g.id} className="card flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{g.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{g.id === 'tictactoe' ? 'Classic 3x3 strategy.' : 'Guess the hidden number.'}</p>
                  </div>
                  <button onClick={() => startGame(g.id)} className="btn-primary w-full mt-auto">Play</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {active?.type === 'tictactoe' && <div className="card"><TicTacToe gameId={active.gameId} onExit={leaveGame} /></div>}
        {active?.type === 'numberguess' && <div className="card"><NumberGuess gameId={active.gameId} onExit={leaveGame} /></div>}
      </main>
      <footer className="py-6 text-center text-xs text-slate-600">© {new Date().getFullYear()} gaMerZ. Built with Go & React.</footer>
    </div>
  );
};
