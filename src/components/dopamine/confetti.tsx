"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-based particle burst. Lightweight (no library), tuned to feel like
 * a chunky satisfying pop rather than a polite sprinkle.
 *
 * `intensity` is a 0.5-3 multiplier:
 *   0.5 = micro (water cup)
 *   1   = habit / task
 *   2   = workout / content
 *   3   = level milestone / close
 */
interface Props {
  x: number;
  y: number;
  intensity: number;
}

const COLORS = [
  "#a78bfa", // violet
  "#22d3ee", // cyan
  "#34d399", // emerald
  "#fbbf24", // amber
  "#f472b6", // pink
  "#60a5fa", // blue
  "#facc15", // yellow
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  rotV: number;
  life: number;
  /** 0 = circle, 1 = rect */
  shape: number;
}

export function Confetti({ x, y, intensity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const count = Math.round(24 * intensity);
    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * (4 * intensity);
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3 * intensity,
        size: 3 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.4,
        life: 1,
        shape: Math.random() < 0.5 ? 0 : 1,
      };
    });

    let raf = 0;
    let start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.vy += 0.35; // gravity
        p.vx *= 0.985;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        p.life = Math.max(0, 1 - elapsed / 1600);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
        }
        ctx.restore();
      });

      if (elapsed < 1700) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, y, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    />
  );
}
