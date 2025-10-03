import React, { useEffect, useState } from 'react';

interface Props { gameId: string; onExit(): void }
interface State { tries: number; last: number; hint: string; won: boolean }

export const NumberGuess: React.FC<Props> = ({ gameId, onExit }) => {
  const [state, setState] = useState<State | null>(null);
  const [input, setInput] = useState('');

  const refresh = async () => {
    const res = await fetch(`/api/games/numberguess/${gameId}`);
    if (res.ok) setState(await res.json());
  };

  const guess = async () => {
    if (!input) return;
    const n = parseInt(input, 10);
    if (isNaN(n)) return;
    const res = await fetch(`/api/games/numberguess/${gameId}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n })
    });
    if (res.ok) setState(await res.json());
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Number Guess</h2>
        {state?.won && <span className="ml-auto text-xs px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">Completed</span>}
      </div>
      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter guess (1-100)"
          className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={guess} disabled={state?.won} className="btn-primary">Guess</button>
      </div>
      {state && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-xs">Tries</p>
            <p className="text-slate-100 font-semibold text-lg">{state.tries}</p>
          </div>
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-xs">Status</p>
            <p className="text-slate-100 font-semibold text-lg">{state.won ? 'Finished' : 'Playing'}</p>
          </div>
          <div className="col-span-2 p-3 rounded bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">Hint</p>
            <p className="font-medium capitalize {state.won ? 'text-emerald-300' : 'text-indigo-300'}">{state.hint}</p>
          </div>
          {state.won && (
            <div className="col-span-2 p-3 rounded bg-emerald-900/30 border border-emerald-600/40">
              <p className="text-emerald-200 text-sm font-medium">You won! Secret was {state.last}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
