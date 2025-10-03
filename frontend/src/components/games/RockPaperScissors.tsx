import React, { useEffect, useState } from 'react';

interface Props { gameId: string; onExit(): void }
interface State {
  playerScore: number; aiScore: number; rounds: number; target: number;
  lastPlayer: string; lastAI: string; lastResult: string; finished: boolean; winner: string;
}

export const RockPaperScissors: React.FC<Props> = ({ gameId, onExit }) => {
  const [state, setState] = useState<State | null>(null);
  const [showRules, setShowRules] = useState(false);
  const refresh = async () => { const r = await fetch(`/api/games/rps/${gameId}`); if (r.ok) setState(await r.json()); };
  const play = async (move: string) => { if (state?.finished) return; const r = await fetch(`/api/games/rps/${gameId}/play`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ move }) }); if (r.ok) setState(await r.json()); };
  const reset = async () => { const r = await fetch(`/api/games/rps/${gameId}/reset`, { method:'POST' }); if (r.ok) setState(await r.json()); };
  useEffect(()=>{ refresh(); },[]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight heading-gradient">Rock Paper Scissors</h2>
        {state?.finished && <span className="text-xs px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">Finished</span>}
  <button onClick={reset} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">Reset</button>
  <button onClick={()=>setShowRules(s=>!s)} className="ml-auto text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">{showRules? 'Hide Rules':'Show Rules'}</button>
        <button onClick={onExit} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">Exit</button>
      </div>
      <div className="flex gap-2 justify-center">
        {['rock','paper','scissors'].map(m => (
          <button key={m} disabled={!!state?.finished} onClick={()=>play(m)} className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm capitalize disabled:opacity-40">{m}</button>
        ))}
      </div>
      {state && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded bg-slate-800 border border-slate-700"><p className="text-xs text-slate-400">Player</p><p className="text-lg font-semibold text-slate-100">{state.playerScore}</p></div>
          <div className="p-3 rounded bg-slate-800 border border-slate-700"><p className="text-xs text-slate-400">AI</p><p className="text-lg font-semibold text-slate-100">{state.aiScore}</p></div>
          <div className="col-span-2 p-3 rounded bg-slate-800 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Last Round</p>
            {state.rounds === 0 ? <p className="text-slate-500">No rounds yet.</p> : (
              <p className="text-slate-200">You: <span className="font-medium text-indigo-300">{state.lastPlayer}</span> vs AI: <span className="font-medium text-pink-300">{state.lastAI}</span> → <span className={state.lastResult==='win'? 'text-emerald-300': state.lastResult==='lose'? 'text-rose-300':'text-slate-300'}>{state.lastResult}</span></p>
            )}
          </div>
          {state.finished && (
            <div className="col-span-2 p-3 rounded bg-emerald-900/30 border border-emerald-600/40 text-center text-sm font-medium text-emerald-200">Winner: {state.winner === 'player' ? 'You' : 'AI'}</div>
          )}
        </div>
      )}
      {showRules && (
        <div className="text-xs sm:text-sm leading-relaxed bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-slate-200 text-sm">How to Play</h3>
          <p>First to reach the target score wins (default 3). Rock beats Scissors, Scissors beats Paper, Paper beats Rock.</p>
          <p className="text-slate-400">Strategy: mix moves; avoid predictable repetition.</p>
        </div>
      )}
    </div>
  );
};
