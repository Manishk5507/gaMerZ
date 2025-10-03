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
    <div>
      <h2>Number Guess</h2>
      <button onClick={onExit}>Back</button>
      <div style={{ marginTop: 16 }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter guess (1-100)" />
        <button onClick={guess} disabled={state?.won}>Guess</button>
      </div>
      {state && (
        <div>
          <p>Tries: {state.tries}</p>
          <p>Status: {state.won ? 'Finished' : 'In progress'}</p>
          <p>Hint: {state.hint}</p>
          {state.won && <strong>You won! Secret was {state.last}</strong>}
        </div>
      )}
    </div>
  );
};
