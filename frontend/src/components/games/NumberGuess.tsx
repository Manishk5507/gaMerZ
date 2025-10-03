import React, { useEffect, useState } from 'react';

interface Props { gameId: string; onExit(): void }
interface State { tries: number; last: number; hint: string; won: boolean; max: number; difficulty: string }

export const NumberGuess: React.FC<Props> = ({ gameId, onExit }) => {
  const [state, setState] = useState<State | null>(null);
  const [input, setInput] = useState('');
  const [showRules, setShowRules] = useState(false);

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
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight heading-gradient">Number Guess</h2>
        {state?.won && <span className="text-xs px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">Completed</span>}
        <button onClick={() => setShowRules(s=>!s)} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition ml-auto">{showRules ? 'Hide Rules' : 'Show Rules'}</button>
        <button onClick={onExit} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">Exit</button>
      </div>
      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={state ? `Enter guess (1-${state.max})` : 'Enter guess'}
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
            <p className="text-slate-400 text-xs">Range</p>
            <p className="text-slate-100 font-semibold text-lg">1 – {state.max}</p>
          </div>
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-xs">Status</p>
            <p className="text-slate-100 font-semibold text-lg">{state.won ? 'Finished' : 'Playing'}</p>
          </div>
          <div className="p-3 rounded bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-xs">Difficulty</p>
            <p className="text-slate-100 font-semibold text-lg capitalize">{state.difficulty}</p>
          </div>
          <div className="col-span-2 p-3 rounded bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">Hint</p>
            <p className={`font-medium ${state.hint === 'correct' ? 'text-emerald-300' : state.hint === 'out-of-range' ? 'text-rose-300' : 'text-indigo-300'}`}>{state.hint}</p>
          </div>
          {state.won && (
            <div className="col-span-2 p-3 rounded bg-emerald-900/30 border border-emerald-600/40">
              <p className="text-emerald-200 text-sm font-medium">You won! Secret was {state.last}</p>
            </div>
          )}
        </div>
      )}
      {showRules && (
        <div className="text-xs sm:text-sm leading-relaxed bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-slate-200 text-sm">How to Play</h3>
          <p>Guess the hidden number between <strong>1 and {state?.max ?? 100}</strong>. After each guess you get a hint:</p>
          <ul className="list-disc pl-5 space-y-1 marker:text-indigo-400">
            <li><span className="font-medium text-slate-300">higher</span> → secret is larger.</li>
            <li><span className="font-medium text-slate-300">lower</span> → secret is smaller.</li>
            <li><span className="font-medium text-emerald-300">correct</span> → you found it.</li>
            <li><span className="font-medium text-rose-300">out-of-range</span> → guess wasn’t inside 1–{state?.max ?? 100} (not counted).</li>
          </ul>
          <p className="text-slate-400">Difficulty sets the range: easy (1–50), normal (1–100), hard (1–500), insane (1–1000).</p>
          <p className="text-slate-500 italic text-[11px]">Binary search tip: always aim for the midpoint of the remaining interval. Max guesses needed ≈ log2(range).</p>
        </div>
      )}
    </div>
  );
};
