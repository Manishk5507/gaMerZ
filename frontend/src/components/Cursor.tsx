import React, { useEffect, useRef } from 'react';

// Lightweight pseudo-3D cursor using layered div & transform perspective
// No external deps. Disables on touch / coarse pointers.
export const Cursor: React.FC = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const vel = useRef({ vx: 0, vy: 0 });
  const state = useRef({ down: false, hover: false });
  const raf = useRef<number | null>(null);

  // Skip on coarse pointer (mobile) or reduced motion (fall back to default cursor)
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse) return null;

  useEffect(() => {
    const el = ref.current!;
    const handleMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      const t = e.target as HTMLElement | null;
      const interactive = !!t && (t.closest('button, a, [role="button"], input, select, textarea') !== null);
      if (interactive !== state.current.hover) {
        state.current.hover = interactive;
        el.dataset.hover = interactive ? '1' : '0';
      }
    };
    const handleDown = () => { state.current.down = true; el.dataset.down = '1'; };
    const handleUp = () => { state.current.down = false; el.dataset.down = '0'; };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const loop = () => {
      const ease = prefersReduced ? 1 : 0.18;
      const p = pos.current; const t = target.current;
      const prevX = p.x, prevY = p.y;
      p.x = lerp(p.x, t.x, ease);
      p.y = lerp(p.y, t.y, ease);
      vel.current.vx = p.x - prevX;
      vel.current.vy = p.y - prevY;
      const vx = vel.current.vx; const vy = vel.current.vy;
      // Compute small tilt based on velocity
      const maxTilt = 12; // degrees
      const rotY = (vx / 25) * maxTilt;
      const rotX = (-vy / 25) * maxTilt;
      const scale = state.current.down ? 0.55 : state.current.hover ? 1.15 : 1;
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale})`;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div ref={ref} className="custom-cursor" aria-hidden="true">
      <div className="cc-core" />
      <div className="cc-ring" />
      <div className="cc-glow" />
    </div>
  );
};
