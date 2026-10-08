'use client';

import React, { memo } from 'react';

// 40 deterministic twinkling quantum points (avoids SSR hydration mismatches)
const PARTICLES = Array.from({ length: 42 }, (_, i) => {
  const pseudoRand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const top = `${(pseudoRand(i * 1.37 + 1) * 96 + 2).toFixed(2)}%`;
  const left = `${(pseudoRand(i * 2.71 + 2) * 96 + 2).toFixed(2)}%`;
  const size = i % 3 === 0 ? 'w-1 h-1' : 'w-0.5 h-0.5';
  const duration = `${(2.2 + pseudoRand(i * 3.14 + 3) * 3.8).toFixed(1)}s`; // 2.2s to 6.0s
  const delay = `${(2.0 + pseudoRand(i * 4.67 + 4) * 4.0).toFixed(1)}s`; // 2.0s to 6.0s
  const maxOpacity = (0.2 + pseudoRand(i * 5.89 + 5) * 0.6).toFixed(2); // 0.20 to 0.80
  const color =
    i % 6 === 0
      ? 'bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.85)]'
      : i % 8 === 0
      ? 'bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.75)]'
      : 'bg-slate-200 shadow-[0_0_4px_rgba(241,245,249,0.7)]';

  return { id: i, top, left, size, duration, delay, maxOpacity, color };
});

const BEAMS = [
  {
    id: 1,
    top: '16%',
    right: '12%',
    duration: '8.2s',
    delay: '0.6s',
  },
  {
    id: 2,
    top: '46%',
    right: '28%',
    duration: '11.4s',
    delay: '4.8s',
  },
  {
    id: 3,
    top: '74%',
    right: '8%',
    duration: '9.5s',
    delay: '7.8s',
  },
];

export const ParticleBackground = memo(function ParticleBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none"
    >
      <style>{`
        @keyframes scintillationPulse {
          0%, 100% {
            opacity: 0.12;
            transform: scale(0.85);
          }
          50% {
            opacity: var(--max-op, 0.65);
            transform: scale(1.3);
          }
        }
        @keyframes cosmicStreak {
          0% {
            transform: translate3d(140px, -140px, 0) rotate(-45deg);
            opacity: 0;
          }
          2% {
            opacity: 0.95;
          }
          12% {
            transform: translate3d(-680px, 680px, 0) rotate(-45deg);
            opacity: 0;
          }
          100% {
            transform: translate3d(-680px, 680px, 0) rotate(-45deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .quantum-particle,
          .cosmic-beam {
            animation: none !important;
          }
          .cosmic-beam {
            display: none !important;
          }
        }
      `}</style>

      {/* Twinkling Quantum Points / Scintillation */}
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className={`quantum-particle absolute rounded-full ${p.size} ${p.color}`}
          style={
            {
              top: p.top,
              left: p.left,
              animation: `scintillationPulse ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
              '--max-op': p.maxOpacity,
              opacity: 0.15,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Cosmic Particle Beams / Ionizing Radiation Trails */}
      {BEAMS.map((beam) => (
        <div
          key={beam.id}
          className="cosmic-beam absolute h-[1px] w-[140px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          style={{
            top: beam.top,
            right: beam.right,
            animation: `cosmicStreak ${beam.duration} cubic-bezier(0.25, 1, 0.5, 1) infinite`,
            animationDelay: beam.delay,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
});

export default ParticleBackground;
