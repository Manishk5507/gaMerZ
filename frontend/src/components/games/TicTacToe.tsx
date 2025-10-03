import React, { useEffect, useState } from 'react';

interface Props { gameId: string; onExit(): void }
interface State { board: string[]; currentPlayer: string; winner: string }

export const TicTacToe: React.FC<Props> = ({ gameId, onExit }) => {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await fetch(`/api/games/tictactoe/${gameId}`);
    if (res.ok) {
      const data = await res.json();
      setState(data);
    }
    setLoading(false);
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
    }
  };

  useEffect(() => { refresh(); }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Tic Tac Toe</h2>
        <span className="ml-auto text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">Turn: {state?.currentPlayer}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            onClick={() => move(i)}
            disabled={!!state?.winner || !!state?.board?.[i]}
            className="h-24 w-24 text-4xl font-bold flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed border border-slate-700 transition"
          >
            {state?.board?.[i] || ''}
          </button>
        ))}
      </div>
      {state?.winner && (
        <p className="text-center text-sm font-medium text-slate-200">
          {state.winner === 'D' ? 'Draw Game' : `Winner: ${state.winner}`}
        </p>
      )}
    </div>
  );
};
