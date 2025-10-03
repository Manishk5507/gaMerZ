import React, { useEffect, useState, useCallback } from 'react';
import { TicTacToe } from './components/games/TicTacToe';
import { NumberGuess } from './components/games/NumberGuess';
import { PuzzlePieceIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LandingPage } from './components/LandingPage';
import { Background3D } from './components/Background3D';

interface GameMeta { id: string; name: string }

type ActiveGame = { type: 'tictactoe'; gameId: string } | { type: 'numberguess'; gameId: string } | null;

export const App: React.FC = () => {
  const [games, setGames] = useState<GameMeta[]>([]);
  const [active, setActive] = useState<ActiveGame>(null);
  const [entered, setEntered] = useState(false);
  const [scale, setScale] = useState(1);
  const [showTTTDialog, setShowTTTDialog] = useState(false);
  const [tttVsAI, setTttVsAI] = useState(true);
  const [tttDifficulty, setTttDifficulty] = useState<'easy'|'optimal'>('easy');

  useEffect(() => {
    if (!entered) return; // Load games only after entering
    fetch('/api/games/list').then(r => r.json()).then(setGames).catch(console.error);
  }, [entered]);

  // Keyboard zoom (Ctrl/Cmd + +/- / 0)
  const handleKey = useCallback((e: KeyboardEvent) => {
    const meta = e.ctrlKey || e.metaKey;
    if (!meta) return;
    if (['=','+'].includes(e.key)) { e.preventDefault(); setScale(s => Math.min(1.4, +(s + 0.05).toFixed(2))); }
    else if (e.key === '-') { e.preventDefault(); setScale(s => Math.max(0.7, +(s - 0.05).toFixed(2))); }
    else if (e.key === '0') { e.preventDefault(); setScale(1); }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-scale', scale.toString());
  }, [scale]);

  const startGame = async (id: string) => {
    let body: any = undefined;
    if (id === 'tictactoe') {
      body = { vsAI: tttVsAI, difficulty: tttDifficulty };
    }
    const res = await fetch(`/api/games/${id}/new`, { method: 'POST', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    setActive({ type: id as any, gameId: data.gameId });
    setShowTTTDialog(false);
  };

  const leaveGame = () => setActive(null);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ transform: `scale(var(--app-scale))`, transformOrigin: 'top center' }}>
      <Background3D />
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <PuzzlePieceIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold tracking-tight heading-gradient">gaMerZ</h1>
          {active && (
            <button onClick={leaveGame} className="ml-auto inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white transition">
              <ArrowLeftIcon className="h-4 w-4" /> Back
            </button>
          )}
          {!active && entered && (
            <div className="ml-auto hidden md:flex items-center gap-4 text-xs text-slate-400">
              <span>Zoom: {(scale*100).toFixed(0)}%</span>
              <span className="hidden lg:inline">Ctrl/Cmd + (+ / - / 0)</span>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 relative">
        {!entered && !active && (
          <LandingPage onEnter={() => setEntered(true)} />
        )}
        {entered && !active && (
          <div className="space-y-8 animate-fade-in">
            <section>
              <h2 className="text-xl sm:text-2xl font-medium text-slate-200 mb-2">Pick a Game</h2>
              <p className="text-sm text-slate-400">Choose a mini-game below to start playing instantly.</p>
            </section>
            <ul className="grid gap-6 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
              {games.map(g => (
                <li key={g.id} className="card flex flex-col hover:border-indigo-600/60 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{g.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{g.id === 'tictactoe' ? 'Classic 3x3 strategy.' : 'Guess the hidden number.'}</p>
                  </div>
                  <button onClick={() => g.id === 'tictactoe' ? setShowTTTDialog(true) : startGame(g.id)} className="btn-primary w-full mt-auto">Play</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {active?.type === 'tictactoe' && <div className="card max-w-md mx-auto"><TicTacToe gameId={active.gameId} onExit={leaveGame} /></div>}
        {active?.type === 'numberguess' && <div className="card max-w-md mx-auto"><NumberGuess gameId={active.gameId} onExit={leaveGame} /></div>}
      </main>
      <footer className="py-6 text-center text-xs text-slate-600 relative">© {new Date().getFullYear()} gaMerZ. Built with Go & React.</footer>
      {showTTTDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900/80 p-5 space-y-5 shadow-xl">
            <div>
              <h3 className="text-lg font-semibold heading-gradient mb-1">Start Tic Tac Toe</h3>
              <p className="text-xs text-slate-400">Configure mode & difficulty.</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <label className="font-medium">Play vs AI</label>
                <input type="checkbox" checked={tttVsAI} onChange={e => setTttVsAI(e.target.checked)} className="h-4 w-4 accent-indigo-500" />
              </div>
              {tttVsAI && (
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wide text-slate-400">Difficulty</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['easy','optimal'] as const).map(d => (
                      <button key={d} onClick={()=>setTttDifficulty(d)} className={`px-3 py-2 rounded-md border text-xs font-medium transition ${tttDifficulty===d? 'border-indigo-500 bg-indigo-600/30 text-indigo-200':'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>{d}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={()=>startGame('tictactoe')} className="btn-primary flex-1">Start</button>
              <button onClick={()=>setShowTTTDialog(false)} className="flex-1 text-xs px-3 py-2 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
