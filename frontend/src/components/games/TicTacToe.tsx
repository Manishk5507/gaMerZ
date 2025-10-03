import React, { useEffect, useState } from 'react';

interface Props { gameId: string; onExit(): void }
interface State { board: string[]; currentPlayer: string; winner: string; winningLine?: number[]; moves?: {pos:number;player:string}[]; vsAI?: boolean; difficulty?: string }

export const TicTacToe: React.FC<Props> = ({ gameId, onExit }) => {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const refresh = async () => {
    const res = await fetch(`/api/games/tictactoe/${gameId}`);
    if (res.ok) {
      const data = await res.json();
      setState(data);
    }
    setLoading(false);
  };

  const playTone = (freq: number, dur=0.12) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  };

  const move = async (pos: number) => {
    if (state?.winner) return; // ignore after finish
    const res = await fetch(`/api/games/tictactoe/${gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pos })
    });
    if (res.ok) {
      const data = await res.json();
      setState(data);
      playTone( state?.currentPlayer === 'X' ? 540 : 380 );
      if (data.winner && data.winner !== 'D') setTimeout(()=>playTone(760,0.4), 60);
      if (data.winner === 'D') setTimeout(()=>{ playTone(300,0.18); setTimeout(()=>playTone(260,0.22),120); }, 60);
    }
  };

  const reset = async () => {
    const res = await fetch(`/api/games/tictactoe/${gameId}/reset`, { method: 'POST' });
    if (res.ok) { const data = await res.json(); setState(data); }
  };

  const undo = async () => {
    const res = await fetch(`/api/games/tictactoe/${gameId}/undo`, { method: 'POST' });
    if (res.ok) { const data = await res.json(); setState(data); }
  };

  useEffect(() => { refresh(); }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  const winning = new Set(state?.winningLine ?? []);
  const marks = state?.board ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight heading-gradient">Tic Tac Toe {state?.vsAI && <span className="text-xs font-normal text-indigo-300 ml-1">vs AI</span>}</h2>
        <span className="ml-auto text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">Turn: {state?.currentPlayer}</span>
        {state?.vsAI && (
          <span className="text-[10px] px-2 py-1 rounded bg-indigo-600/30 border border-indigo-500 text-indigo-200">{state.difficulty}</span>
        )}
        <button onClick={reset} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">Reset</button>
        <button onClick={undo} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition disabled:opacity-40" disabled={!state?.moves || state.moves.length===0}>Undo</button>
        <button onClick={() => setShowRules(s => !s)} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">{showRules ? 'Hide Rules' : 'Show Rules'}</button>
        <button onClick={onExit} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">Exit</button>
      </div>
      <div className="relative mx-auto ttt-board select-none" style={{width:'min(100%,420px)'}}>
        {/* Grid background */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2" aria-hidden>
          {Array.from({length:9}).map((_,i)=> <div key={i} className="border border-slate-700/70 rounded-lg" />)}
        </div>
        {/* Interactive layer */}
        <div className="relative grid grid-cols-3 grid-rows-3 gap-2 p-2">
          {Array.from({ length: 9 }).map((_, i) => {
            const mark = marks[i];
            return (
              <button
                key={i}
                onClick={() => move(i)}
                disabled={!!state?.winner || !!mark}
                className={
                  'aspect-square w-full rounded-lg flex items-center justify-center text-3xl sm:text-4xl font-extrabold tracking-wider transition focus:outline-none focus-visible:ring-2 ring-indigo-400 ' +
                  (winning.has(i) ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-900/70 hover:bg-slate-800 border border-slate-700/70') +
                  (mark ? ' cursor-default' : '')
                }
              >
                {mark && <span className={"ttt-cell-mark " + (mark === 'X' ? 'text-indigo-300 drop-shadow-[0_0_4px_#6366f1aa]' : 'text-pink-300 drop-shadow-[0_0_4px_#ec4899aa]')}>{mark}</span>}
              </button>
            );
          })}
        </div>
        {/* Winning line overlay */}
        {state?.winner && state.winner !== 'D' && state.winningLine && (
          <div className={
            'win-line ' +
            (() => {
              const l = state.winningLine;
              const sets = [[0,1,2],[3,4,5],[6,7,8]];
              for (let r=0;r<3;r++){ if (l[0]===sets[r][0] && l[1]===sets[r][1]) return `win-row-${r}`; }
              if (l[0]===0 && l[1]===3) return 'win-col-0';
              if (l[0]===1 && l[1]===4) return 'win-col-1';
              if (l[0]===2 && l[1]===5) return 'win-col-2';
              if (l[0]===0 && l[1]===4) return 'win-diag-main';
              if (l[0]===2 && l[1]===4) return 'win-diag-anti';
              return '';
            })()
          } />
        )}
        {state?.winner && (
          <div className="mt-4 text-center text-sm font-medium">
            {state.winner === 'D' ? <span className="text-slate-300">Draw Game</span> : <span className="text-indigo-300">Winner: {state.winner}</span>}
          </div>
        )}
      </div>
    {state?.moves && state.moves.length > 0 && (
        <div className="text-xs text-slate-400 flex flex-wrap gap-2">
          <span className="font-semibold text-slate-300">Moves:</span>
      {state.moves.map((m,i) => <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700">{i+1}:{m.player}{'@'}{m.pos}</span>)}
        </div>
      )}
      {showRules && (
        <div className="text-xs sm:text-sm leading-relaxed bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-slate-200 text-sm">How to Play</h3>
          <p>Two players (X and O) take turns marking empty cells in a 3×3 grid. The goal is to be the first to align three of your symbols horizontally, vertically, or diagonally.</p>
          <ul className="list-disc pl-5 space-y-1 marker:text-indigo-400">
            <li>X always goes first.</li>
            <li>Choose an empty square to place your mark.</li>
            <li>The highlighted cells show the winning line when the game ends.</li>
            <li>If all 9 squares fill without a 3‑in‑a‑row, the game is a draw.</li>
          </ul>
          <p className="text-slate-400">Strategy tips: take the center when possible, create forks, and block your opponent's potential lines.</p>
        </div>
      )}
    </div>
  );
};
