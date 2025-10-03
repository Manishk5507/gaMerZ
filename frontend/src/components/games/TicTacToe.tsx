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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Tic Tac Toe</h2>
      <button onClick={onExit}>Back</button>
      <p>Turn: {state?.currentPlayer}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 4, marginTop: 16 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <button key={i} style={{ height: 80, fontSize: 32 }} onClick={() => move(i)} disabled={!!state?.winner || !!state?.board?.[i]}>
            {state?.board?.[i] || ' '}
          </button>
        ))}
      </div>
      {state?.winner && <p>Winner: {state.winner === 'D' ? 'Draw' : state.winner}</p>}
    </div>
  );
};
