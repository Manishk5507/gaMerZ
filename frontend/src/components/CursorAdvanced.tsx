import React, { useEffect, useRef } from 'react';

/*
  Advanced trending cursor (2025 style):
  - Glassy gradient blob + subtle ring
  - Particle trail (Canvas 2D) with additive glow
  - Magnetic attraction toward interactive elements
  - Click pulse + hover color shift
  - Respects reduced motion & coarse pointers (falls back)
*/
export const CursorAdvanced: React.FC = () => {
  const blobRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const target = useRef({ x: pos.current.x, y: pos.current.y });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>();
  const hoverState = useRef(false);
  const downState = useRef(false);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse) return null;

  interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; }

  useEffect(() => {
    const blob = blobRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const lerp = (a:number,b:number,n:number)=>a+(b-a)*n;

    const updateMagnetic = (e: PointerEvent) => {
      target.current.x = e.clientX; target.current.y = e.clientY;
      const t = e.target as HTMLElement | null;
      const interactive = !!t && !!t.closest('button, a, [role="button"], input, select, textarea');
      if (interactive !== hoverState.current) {
        hoverState.current = interactive;
        blob.dataset.hover = interactive ? '1' : '0';
      }
    };
    const onDown = () => { downState.current = true; blob.dataset.down = '1'; };
    const onUp = () => { downState.current = false; blob.dataset.down = '0'; };
    window.addEventListener('pointermove', updateMagnetic, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    const spawnParticle = (x:number,y:number) => {
      if (reduced) return;
      if (particles.current.length > 90) particles.current.splice(0, particles.current.length - 90);
      const angle = Math.random()*Math.PI*2;
      const speed = (Math.random()*0.6)+0.2;
      particles.current.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life:0, max: 40 + Math.random()*25 });
    };

    const loop = () => {
      const p = pos.current; const t = target.current;
      const ease = reduced ? 1 : 0.20;
      p.x = lerp(p.x, t.x, ease); p.y = lerp(p.y, t.y, ease);

      // Magnetic effect: if hovering interactive element, subtle overshoot toward element center
      if (hoverState.current && !reduced) {
        const el = document.elementFromPoint(t.x, t.y) as HTMLElement | null;
        const container = el?.closest('button, a, [role="button"], input, select, textarea') as HTMLElement | null;
        if (container) {
          const r = container.getBoundingClientRect();
            const cx = r.left + r.width/2;
            const cy = r.top + r.height/2;
            p.x = lerp(p.x, cx, 0.08);
            p.y = lerp(p.y, cy, 0.08);
        }
      }

      // Move blob
      blob.style.transform = `translate3d(${p.x}px, ${p.y}px,0)`;

      // Particles
      spawnParticle(p.x, p.y);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i=particles.current.length-1;i>=0;i--) {
        const part = particles.current[i];
        part.life++;
        part.x += part.vx;
        part.y += part.vy;
        const alpha = 1 - part.life/part.max;
        if (alpha <= 0) { particles.current.splice(i,1); continue; }
        const radius = 5 * alpha;
        const gradient = ctx.createRadialGradient(part.x, part.y, 0, part.x, part.y, radius*4);
        gradient.addColorStop(0, `rgba(99,102,241,${0.35*alpha})`);
        gradient.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(part.x, part.y, radius*4, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', updateMagnetic);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return (
    <>
      <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />
      <div ref={blobRef} className="cursor-blob" aria-hidden="true">
        <div className="cb-ring" />
      </div>
    </>
  );
};
