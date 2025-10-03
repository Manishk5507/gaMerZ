import React, { useEffect, useState } from 'react';

interface Props { gameId: string; onExit(): void }
interface State { masked: string; guessed: string[]; wrong: number; maxWrong: number; finished: boolean; won: boolean; difficulty: string }

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const Hangman: React.FC<Props> = ({ gameId, onExit }) => {
  const [state, setState] = useState<State | null>(null);
  const [showRules, setShowRules] = useState(false);
  const refresh = async () => { const r = await fetch(`/api/games/hangman/${gameId}`); if (r.ok) setState(await r.json()); };
  const guess = async (letter: string) => { if (state?.finished) return; const r = await fetch(`/api/games/hangman/${gameId}/guess`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ letter }) }); if (r.ok) setState(await r.json()); };
  const reset = async () => { const r = await fetch(`/api/games/hangman/${gameId}/reset`, { method:'POST' }); if (r.ok) setState(await r.json()); };
  useEffect(()=>{ refresh(); },[]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight heading-gradient">Hangman</h2>
        {state?.finished && <span className="text-xs px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">{state.won? 'Won':'Finished'}</span>}
  <button onClick={reset} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">Reset</button>
  <button onClick={()=>setShowRules(s=>!s)} className="ml-auto text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">{showRules? 'Hide Rules':'Show Rules'}</button>
        <button onClick={onExit} className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition">Exit</button>
      </div>
      {state && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded bg-slate-800 border border-slate-700">
            <div className="text-sm"><span className="text-slate-400">Word:</span> <span className="font-mono tracking-wider text-lg text-slate-100">{state.masked.split('').join(' ')}</span></div>
            <div className="text-xs text-slate-400">Wrong {state.wrong}/{state.maxWrong}</div>
          </div>
          <div className="grid grid-cols-13 gap-1 text-xs">
            {alphabet.map(l => {
              const used = (state?.guessed ?? []).includes(l);
              return (
                <button key={l} disabled={used || state.finished} onClick={()=>guess(l)} className={`px-2 py-1 rounded border font-medium ${used ? 'bg-slate-700/60 border-slate-600 text-slate-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'} disabled:opacity-40`}>{l}</button>
              );
            })}
          </div>
          {state.finished && (
            <div className={`p-3 rounded text-center border ${state.won? 'bg-emerald-900/30 border-emerald-600/40 text-emerald-200':'bg-rose-900/30 border-rose-600/40 text-rose-200'} text-sm font-medium`}>{state.won? 'You solved it!':'Out of guesses.'}</div>
          )}
        </div>
      )}
      {showRules && (
        <div className="text-xs sm:text-sm leading-relaxed bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-slate-200 text-sm">How to Play</h3>
          <p>Guess the hidden word one letter at a time. Each wrong guess advances the hangman. You lose if you reach the maximum wrong guesses ({state?.maxWrong}).</p>
          <p className="text-slate-400">Difficulty affects word length & allowed mistakes.</p>
          <p className="text-slate-500 italic text-[11px]">Tip: Start with common vowels (a, e) then frequent consonants (r, s, t, n, l).</p>
        </div>
      )}
    </div>
  );
};
